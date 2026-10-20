"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { ChevronDown, ShoppingBag } from "lucide-react";
import {
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
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { saveLastOrder } from "../../lib/last-order";
import { placeOrder } from "../../lib/orders";

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

    const [values, setValues] = useState<CheckoutValues>(emptyCheckoutValues);
    const [errors, setErrors] = useState<CheckoutErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<string | null>(null);

    function updateField(field: CheckoutField, value: string) {
        setValues((current) => ({ ...current, [field]: value }));

        if (errors[field]) {
            setErrors((current) => ({ ...current, [field]: undefined }));
        }
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

        setSubmitting(true);

        const outcome = await placeOrder({
            customer: result.values,
            items: lines.map((line) => ({
                productId: line.product.id,
                quantity: line.quantity,
            })),
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

                <ul className="mt-4 space-y-3">
                    {lines.map(({ product, quantity, lineTotal }) => (
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

                {/* TODO: add the delivery fee here once the delivery rules are decided. */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-semibold text-foreground">মোট</span>
                    <span className="text-xl font-bold text-foreground">
                        ৳{subtotal}
                    </span>
                </div>
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
                            <div className="relative">
                                <select
                                    id="checkout-upazila"
                                    name="upazila"
                                    aria-required="true"
                                    aria-invalid={errors.upazila ? true : undefined}
                                    aria-describedby={describedBy(
                                        "checkout-upazila",
                                        errors.upazila,
                                    )}
                                    value={values.upazila}
                                    onChange={(event) =>
                                        updateField("upazila", event.target.value)
                                    }
                                    className={`h-12 appearance-none pr-11 ${controlClass(
                                        Boolean(errors.upazila),
                                    )}`}
                                >
                                    <option value="">উপজেলা বেছে নিন</option>
                                    {UPAZILAS.map((upazila) => (
                                        <option key={upazila} value={upazila}>
                                            {upazila}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown
                                    aria-hidden="true"
                                    className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                                />
                            </div>
                        </Field>

                        <Field
                            id="checkout-union"
                            label="ইউনিয়ন / পৌরসভা"
                            required
                            error={errors.union}
                        >
                            <input
                                id="checkout-union"
                                type="text"
                                name="union"
                                autoComplete="off"
                                placeholder="ইউনিয়ন বা পৌরসভার নাম"
                                aria-required="true"
                                aria-invalid={errors.union ? true : undefined}
                                aria-describedby={describedBy(
                                    "checkout-union",
                                    errors.union,
                                )}
                                value={values.union}
                                onChange={(event) =>
                                    updateField("union", event.target.value)
                                }
                                className={`h-12 ${controlClass(Boolean(errors.union))}`}
                            />
                        </Field>

                        <Field
                            id="checkout-ward"
                            label="ওয়ার্ড নম্বর"
                            hint="জানা থাকলে লিখুন (১ থেকে ৯৯)।"
                            error={errors.ward}
                        >
                            <input
                                id="checkout-ward"
                                type="text"
                                name="ward"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="যেমন ৫"
                                aria-invalid={errors.ward ? true : undefined}
                                aria-describedby={describedBy(
                                    "checkout-ward",
                                    errors.ward,
                                    "hint",
                                )}
                                value={values.ward}
                                onChange={(event) =>
                                    updateField("ward", event.target.value)
                                }
                                className={`h-12 ${controlClass(Boolean(errors.ward))}`}
                            />
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