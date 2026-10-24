"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ChevronDown, ShoppingBag } from "lucide-react";
import {
    DEPENDENT_FIELDS,
    FIELD_ORDER,
    UPAZILAS,
    emptyCheckoutValues,
    validateCheckout,
    type CheckoutErrors,
    type CheckoutField,
    type CheckoutValues,
} from "../../lib/checkout";
import {
    clearCart,
    selectAvailableCount,
    selectCartCount,
    selectCartHydrated,
    selectCartLines,
    selectCartSubtotal,
} from "../../lib/features/cartSlice";
import { loadCatalog } from "../../lib/features/catalogSlice";
import {
    getAreas,
    getWardCount,
    toBengaliDigits,
} from "../../lib/feni-areas";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { saveLastOrder } from "../../lib/last-order";
import { placeOrder } from "../../lib/orders";
import { fetchProductOptions, type DeliveryMethod, type MethodSetting } from "../../lib/delivery";

function controlClass(hasError: boolean) {
    return `w-full rounded-xl border bg-input px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 ${hasError
        ? "border-error focus:border-error focus:ring-error/25"
        : "border-border focus:border-focus-ring focus:ring-focus-ring/25"
        }`;
}

type FieldProps = {
    id: string;
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: ReactNode;
};

function Field({ id, label, required, hint, error, children }: FieldProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-foreground"
            >
                {label}
                {required ? (
                    <span aria-hidden="true" className="text-error">
                        {" "}
                        *
                    </span>
                ) : (
                    <span className="font-normal text-muted-foreground">
                        {" "}
                        (ঐচ্ছিক)
                    </span>
                )}
            </label>

            {children}

            {error ? (
                <p id={`${id}-error`} className="mt-1.5 text-sm text-error">
                    {error}
                </p>
            ) : (
                hint && (
                    <p
                        id={`${id}-hint`}
                        className="mt-1.5 text-xs text-muted-foreground"
                    >
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}

function describedBy(id: string, error?: string, hint?: string) {
    if (error) return `${id}-error`;
    if (hint) return `${id}-hint`;
    return undefined;
}

type SelectBoxProps = {
    id: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    hasError: boolean;
    disabled?: boolean;
    required?: boolean;
    describedBy?: string;
    children: ReactNode;
};

// A styled drop-down list with its own arrow icon.
function SelectBox({
    id,
    name,
    value,
    onChange,
    hasError,
    disabled,
    required,
    describedBy: describedById,
    children,
}: SelectBoxProps) {
    return (
        <div className="relative">
            <select
                id={id}
                name={name}
                value={value}
                disabled={disabled}
                aria-required={required ? "true" : undefined}
                aria-invalid={hasError ? true : undefined}
                aria-describedby={describedById}
                onChange={(event) => onChange(event.target.value)}
                className={`h-12 appearance-none pr-11 disabled:cursor-not-allowed disabled:opacity-60 ${controlClass(
                    hasError,
                )}`}
            >
                {children}
            </select>

            <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            />
        </div>
    );
}

export default function CheckoutForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const hydrated = useAppSelector(selectCartHydrated);
    const allLines = useAppSelector(selectCartLines);
    const savedCount = useAppSelector(selectCartCount);
    const count = useAppSelector(selectAvailableCount);
    const subtotal = useAppSelector(selectCartSubtotal);
    const catalogStatus = useAppSelector((state) => state.catalog.status);

    // Sold-out products stay in the cart page but are never ordered.
    const lines = allLines.filter((line) => line.available);
    const sellerGroups = lines.reduce<Array<{ key: string; sellerId: number | null; name: string; subtotal: number; lines: typeof lines }>>((groups, line) => {
        const key = line.product.sellerId === null ? "marketplace" : `seller-${line.product.sellerId}`;
        let group = groups.find((entry) => entry.key === key);
        if (!group) {
            group = {
                key,
                sellerId: line.product.sellerId,
                name: line.product.sellerName ?? "Amar Haat",
                subtotal: 0,
                lines: [],
            };
            groups.push(group);
        }
        group.subtotal += line.lineTotal;
        group.lines.push(line);
        return groups;
    }, []);

    const [values, setValues] = useState<CheckoutValues>(emptyCheckoutValues);
    const [errors, setErrors] = useState<CheckoutErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<string | null>(null);
    const [methodSettings, setMethodSettings] = useState<MethodSetting[]>([]);
    const [sellerMethods, setSellerMethods] = useState<Record<string, DeliveryMethod[]>>({});
    const [deliveryChoices, setDeliveryChoices] = useState<Record<string, DeliveryMethod>>({});
    const [loadingMethods, setLoadingMethods] = useState(true);

    useEffect(() => {
        let active = true;
        if (lines.length === 0) { setLoadingMethods(false); return; }
        setLoadingMethods(true);
        void fetchProductOptions(lines.map((line) => line.product.id)).then((response) => {
            if (!active) return;
            setMethodSettings(response.methods);
            const allowed: Record<string, DeliveryMethod[]> = {};
            for (const group of sellerGroups) {
                const productMethods = group.lines.map((line) => response.products.find((product) => product.slug === line.product.id)?.deliveryMethods ?? ["SELLER"]);
                allowed[group.key] = response.methods.map((setting) => setting.method).filter((method) => productMethods.every((methods) => methods.includes(method)));
            }
            setSellerMethods(allowed);
            setDeliveryChoices((old) => Object.fromEntries(sellerGroups.map((group) => [group.key, allowed[group.key]?.includes(old[group.key]) ? old[group.key] : allowed[group.key]?.[0]]).filter((entry) => Boolean(entry[1]))) as Record<string, DeliveryMethod>);
        }).catch(() => { if (active) setFormMessage("ডেলিভারি পদ্ধতি লোড করা যায়নি। আবার চেষ্টা করুন।"); }).finally(() => { if (active) setLoadingMethods(false); });
        return () => { active = false; };
    }, [lines.map((line) => line.product.id).join(","), sellerGroups.map((group) => group.key).join(",")]);

    // The lists in the union and ward drop-downs depend on the choices above them.
    const areas = getAreas(values.upazila);
    const pourashavas = areas.filter((area) => area.type === "pourashava");
    const unionAreas = areas.filter((area) => area.type === "union");
    const wardCount = values.union
        ? getWardCount(values.upazila, values.union)
        : 0;

    function updateField(field: CheckoutField, value: string) {
        const dependents = DEPENDENT_FIELDS[field] ?? [];

        setValues((current) => {
            const next = { ...current, [field]: value };

            for (const dependent of dependents) {
                next[dependent] = "";
            }

            return next;
        });

        setErrors((current) => {
            const next = { ...current };

            delete next[field];

            for (const dependent of dependents) {
                delete next[dependent];
            }

            return next;
        });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormMessage(null);

        const result = validateCheckout(values);

        if (!result.ok) {
            setErrors(result.errors);

            const firstInvalid = FIELD_ORDER.find((field) => result.errors[field]);

            if (firstInvalid) {
                document.getElementById(`checkout-${firstInvalid}`)?.focus();
            }

            return;
        }

        if (loadingMethods || sellerGroups.some((group) => !deliveryChoices[group.key])) {
            setFormMessage("প্রতিটি বিক্রেতার জন্য ডেলিভারি পদ্ধতি বেছে নিন।");
            return;
        }

        setSubmitting(true);

        const outcome = await placeOrder({
            customer: result.values,
            items: lines.map((line) => ({
                productId: line.product.id,
                quantity: line.quantity,
            })),
            deliveryChoices: sellerGroups.map((group) => ({ sellerId: group.sellerId, method: deliveryChoices[group.key] })),
        });

        setSubmitting(false);

        if (!outcome.ok) {
            setFormMessage(outcome.message);

            // The stock or the product list changed: refresh it so the cart shows the truth.
            if (outcome.stockProblem) {
                dispatch(loadCatalog());
            }

            return;
        }

        // The order is placed. Keep it for the success page, then empty the cart.
        saveLastOrder(outcome.order);
        dispatch(clearCart());
        router.push("/order-success");
    }

    // The saved cart is read in the browser after the first render.
    if (!hydrated) {
        return (
            <p
                role="status"
                className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground"
            >
                চেকআউট লোড হচ্ছে...
            </p>
        );
    }

    // The cart holds only ids, so wait for the products (names, prices) to arrive.
    if (savedCount > 0 && (catalogStatus === "idle" || catalogStatus === "loading")) {
        return (
            <p
                role="status"
                className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground"
            >
                পণ্যের তথ্য লোড হচ্ছে...
            </p>
        );
    }

    if (savedCount > 0 && catalogStatus === "error") {
        return (
            <div
                role="alert"
                className="rounded-2xl border border-border bg-card p-8 text-center"
            >
                <p className="text-lg font-semibold text-foreground">
                    পণ্যের তথ্য লোড করা যায়নি
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    ইন্টারনেট দেখে আবার চেষ্টা করুন। আপনার কার্ট ঠিকই আছে।
                </p>
                <button
                    type="button"
                    onClick={() => dispatch(loadCatalog())}
                    className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                    আবার চেষ্টা করুন
                </button>
            </div>
        );
    }

    if (lines.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
                <ShoppingBag
                    aria-hidden="true"
                    className="size-14 text-muted-foreground"
                    strokeWidth={1.4}
                />

                <div>
                    <p className="text-lg font-semibold text-foreground">
                        অর্ডার করার মতো কোনো পণ্য নেই
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        আগে পছন্দের পণ্য কার্টে যোগ করুন।
                    </p>
                </div>

                <Link
                    href="/products"
                    className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                    কেনাকাটা শুরু করুন
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            {/* Order summary: first on phones, on the right on large screens. */}
            <aside
                aria-labelledby="order-summary-heading"
                className="order-1 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28 lg:order-2"
            >
                <div className="flex items-center justify-between gap-4">
                    <h2
                        id="order-summary-heading"
                        className="text-lg font-bold text-foreground"
                    >
                        আপনার অর্ডার
                    </h2>

                    <Link
                        href="/cart"
                        className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                    >
                        কার্ট বদলান
                    </Link>
                </div>

                <div className="mt-4 space-y-4">
                    {sellerGroups.map((group) => (
                        <section key={group.key} aria-label={`${group.name} থেকে পণ্য`} className="rounded-xl border border-border p-3">
                            <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-2">
                                <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
                                <span className="text-xs text-muted-foreground">আলাদা বিক্রেতা অর্ডার</span>
                            </div>
                            <label className="mb-3 block text-xs font-medium text-muted-foreground">ডেলিভারি পদ্ধতি
                                <select aria-label={`${group.name} delivery method`} disabled={loadingMethods || !sellerMethods[group.key]?.length} value={deliveryChoices[group.key] ?? ""} onChange={(event) => setDeliveryChoices((current) => ({ ...current, [group.key]: event.target.value as DeliveryMethod }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground">
                                    {loadingMethods && <option value="">লোড হচ্ছে…</option>}
                                    {(sellerMethods[group.key] ?? []).map((method) => <option value={method} key={method}>{method === "PLATFORM_RIDER" ? "Amar Haat rider" : method === "SELLER" ? "Seller delivery" : "Pickup"} · ৳{methodSettings.find((setting) => setting.method === method)?.fee ?? 0}</option>)}
                                </select>
                            </label>
                            <ul className="space-y-3">
                    {group.lines.map(({ product, quantity, lineTotal }) => (
                        <li key={product.id} className="flex items-center gap-3">
                            <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt=""
                                        fill
                                        sizes="56px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <span
                                        aria-hidden="true"
                                        className="flex size-full items-center justify-center text-2xl"
                                    >
                                        {product.emoji}
                                    </span>
                                )}
                            </span>

                            <div className="min-w-0 flex-1 text-sm">
                                <p className="line-clamp-2 font-medium text-foreground">
                                    {product.name}
                                </p>
                                <p className="text-muted-foreground">
                                    {quantity} × ৳{product.price}
                                </p>
                            </div>

                            <p className="text-sm font-semibold text-foreground">
                                ৳{lineTotal}
                            </p>
                        </li>
                    ))}
                            </ul>
                            <p className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
                                <span className="text-muted-foreground">এই বিক্রেতার পণ্য</span>
                                <span className="font-semibold text-foreground">৳{group.subtotal}</span>
                            </p>
                        </section>
                    ))}
                </div>

                <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">পণ্য ({count}টি)</dt>
                        <dd className="font-medium text-foreground">৳{subtotal}</dd>
                    </div>

                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">পেমেন্ট</dt>
                        <dd className="font-medium text-foreground">
                            ক্যাশ অন ডেলিভারি
                        </dd>
                    </div>
                </dl>

                {(() => { const fee = sellerGroups.reduce((sum, group) => sum + (methodSettings.find((setting) => setting.method === deliveryChoices[group.key])?.fee ?? 0), 0); return <><div className="mt-4 flex justify-between border-t border-border pt-3 text-sm"><span className="text-muted-foreground">ডেলিভারি ফি</span><span>৳{fee}</span></div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-semibold text-foreground">মোট</span>
                    <span className="text-xl font-bold text-foreground">
                        ৳{subtotal + fee}
                    </span>
                </div></>; })()}
            </aside>

            <form
                onSubmit={handleSubmit}
                noValidate
                className="order-2 space-y-6 lg:order-1"
            >
                <section
                    aria-labelledby="delivery-heading"
                    className="space-y-4 rounded-2xl border border-border bg-card p-5"
                >
                    <div>
                        <h2
                            id="delivery-heading"
                            className="text-lg font-bold text-foreground"
                        >
                            ডেলিভারির তথ্য
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            লগইন ছাড়াই অতিথি হিসেবে অর্ডার করা যাবে।
                        </p>
                    </div>

                    <Field
                        id="checkout-name"
                        label="আপনার নাম"
                        required
                        error={errors.name}
                    >
                        <input
                            id="checkout-name"
                            type="text"
                            name="name"
                            autoComplete="name"
                            aria-required="true"
                            aria-invalid={errors.name ? true : undefined}
                            aria-describedby={describedBy("checkout-name", errors.name)}
                            value={values.name}
                            onChange={(event) => updateField("name", event.target.value)}
                            className={`h-12 ${controlClass(Boolean(errors.name))}`}
                        />
                    </Field>

                    <Field
                        id="checkout-phone"
                        label="মোবাইল নম্বর"
                        required
                        hint="ডেলিভারির সময় এই নম্বরে যোগাযোগ করা হবে।"
                        error={errors.phone}
                    >
                        <input
                            id="checkout-phone"
                            type="tel"
                            name="phone"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="01XXXXXXXXX"
                            aria-required="true"
                            aria-invalid={errors.phone ? true : undefined}
                            aria-describedby={describedBy(
                                "checkout-phone",
                                errors.phone,
                                "hint",
                            )}
                            value={values.phone}
                            onChange={(event) => updateField("phone", event.target.value)}
                            className={`h-12 ${controlClass(Boolean(errors.phone))}`}
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            id="checkout-upazila"
                            label="উপজেলা"
                            required
                            error={errors.upazila}
                        >
                            <SelectBox
                                id="checkout-upazila"
                                name="upazila"
                                value={values.upazila}
                                onChange={(value) => updateField("upazila", value)}
                                hasError={Boolean(errors.upazila)}
                                required
                                describedBy={describedBy(
                                    "checkout-upazila",
                                    errors.upazila,
                                )}
                            >
                                <option value="">উপজেলা বেছে নিন</option>
                                {UPAZILAS.map((upazila) => (
                                    <option key={upazila} value={upazila}>
                                        {upazila}
                                    </option>
                                ))}
                            </SelectBox>
                        </Field>

                        <Field
                            id="checkout-union"
                            label="ইউনিয়ন / পৌরসভা"
                            required
                            error={errors.union}
                        >
                            <SelectBox
                                id="checkout-union"
                                name="union"
                                value={values.union}
                                onChange={(value) => updateField("union", value)}
                                hasError={Boolean(errors.union)}
                                disabled={!values.upazila}
                                required
                                describedBy={describedBy(
                                    "checkout-union",
                                    errors.union,
                                )}
                            >
                                <option value="">
                                    {values.upazila
                                        ? "ইউনিয়ন বা পৌরসভা বেছে নিন"
                                        : "আগে উপজেলা বেছে নিন"}
                                </option>

                                {pourashavas.length > 0 && (
                                    <optgroup label="পৌরসভা">
                                        {pourashavas.map((area) => (
                                            <option key={area.name} value={area.name}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}

                                {unionAreas.length > 0 && (
                                    <optgroup label="ইউনিয়ন">
                                        {unionAreas.map((area) => (
                                            <option key={area.name} value={area.name}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </SelectBox>
                        </Field>

                        <Field
                            id="checkout-ward"
                            label="ওয়ার্ড নম্বর"
                            hint="জানা থাকলে বেছে নিন।"
                            error={errors.ward}
                        >
                            <SelectBox
                                id="checkout-ward"
                                name="ward"
                                value={values.ward}
                                onChange={(value) => updateField("ward", value)}
                                hasError={Boolean(errors.ward)}
                                disabled={!values.union}
                                describedBy={describedBy(
                                    "checkout-ward",
                                    errors.ward,
                                    "hint",
                                )}
                            >
                                <option value="">
                                    {values.union
                                        ? "ওয়ার্ড বেছে নিন"
                                        : "আগে ইউনিয়ন বা পৌরসভা বেছে নিন"}
                                </option>

                                {Array.from({ length: wardCount }, (_, index) => {
                                    const ward = String(index + 1);

                                    return (
                                        <option key={ward} value={ward}>
                                            {toBengaliDigits(ward)} নং ওয়ার্ড
                                        </option>
                                    );
                                })}
                            </SelectBox>
                        </Field>
                    </div>

                    <Field
                        id="checkout-address"
                        label="বিস্তারিত ঠিকানা"
                        required
                        hint="বাড়ি/হোল্ডিং, রাস্তা, গ্রাম বা মহল্লা, কাছের পরিচিত স্থান।"
                        error={errors.address}
                    >
                        <textarea
                            id="checkout-address"
                            name="address"
                            rows={3}
                            autoComplete="street-address"
                            aria-required="true"
                            aria-invalid={errors.address ? true : undefined}
                            aria-describedby={describedBy(
                                "checkout-address",
                                errors.address,
                                "hint",
                            )}
                            value={values.address}
                            onChange={(event) =>
                                updateField("address", event.target.value)
                            }
                            className={`min-h-28 py-3 ${controlClass(
                                Boolean(errors.address),
                            )}`}
                        />
                    </Field>

                    <Field
                        id="checkout-note"
                        label="অর্ডারের নোট"
                        error={errors.note}
                    >
                        <textarea
                            id="checkout-note"
                            name="note"
                            rows={2}
                            aria-invalid={errors.note ? true : undefined}
                            aria-describedby={describedBy("checkout-note", errors.note)}
                            value={values.note}
                            onChange={(event) => updateField("note", event.target.value)}
                            className={`py-3 ${controlClass(Boolean(errors.note))}`}
                        />
                    </Field>
                </section>

                <section
                    aria-labelledby="payment-heading"
                    className="rounded-2xl border border-border bg-card p-5"
                >
                    <h2
                        id="payment-heading"
                        className="text-lg font-bold text-foreground"
                    >
                        পেমেন্ট পদ্ধতি
                    </h2>

                    <div className="mt-3 rounded-xl border border-primary bg-surface-green p-4">
                        <p className="font-semibold text-foreground">
                            ক্যাশ অন ডেলিভারি (COD)
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            পণ্য হাতে পেয়ে টাকা দিন।
                        </p>
                    </div>
                </section>

                {formMessage && (
                    <div
                        role="alert"
                        className="rounded-xl border border-error bg-card p-4 text-sm text-foreground"
                    >
                        <p className="font-semibold text-error">
                            অর্ডার পাঠানো যায়নি
                        </p>
                        <p className="mt-1">{formMessage}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-70"
                >
                    {submitting
                        ? "অর্ডার পাঠানো হচ্ছে..."
                        : `অর্ডার নিশ্চিত করুন · ৳${subtotal}`}
                </button>
            </form>
        </div>
    );
}
