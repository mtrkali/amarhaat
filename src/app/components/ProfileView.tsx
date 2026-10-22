"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import {
    describeError,
    fetchMyOrders,
    fetchMyShop,
    isSessionError,
    updateProfile,
    validateProfile,
    type AuthUser,
    type ProfileErrors,
    type Shop,
} from "../../lib/auth";
import { clearToken } from "../../lib/auth-storage";
import {
    selectAuthStatus,
    selectAuthToken,
    selectAuthUser,
    sessionEnded,
    userUpdated,
} from "../../lib/features/authSlice";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { ORDER_STEPS, type PlacedOrder } from "../../lib/orders";
import AuthField from "./AuthField";

const cardClass = "rounded-2xl border border-border bg-card p-5";
const primaryButton =
    "inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60";
const outlineButton =
    "inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary";

const SHOP_STATUS_LABEL: Record<Shop["status"], string> = {
    PENDING: "আবেদন পর্যালোচনার অপেক্ষায়",
    APPROVED: "অনুমোদিত",
    SUSPENDED: "আপাতত স্থগিত",
};

function orderStatusLabel(status: string) {
    if (status === "CANCELLED") return "বাতিল";

    return ORDER_STEPS.find((step) => step.status === status)?.label ?? status;
}

// ---------- Name and phone ----------

function ProfileDetails({
    user,
    token,
    onExpired,
}: {
    user: AuthUser;
    token: string;
    onExpired: () => void;
}) {
    const dispatch = useAppDispatch();

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone);
    const [errors, setErrors] = useState<ProfileErrors>({});
    const [formError, setFormError] = useState("");
    const [saved, setSaved] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    function startEditing() {
        setName(user.name);
        setPhone(user.phone);
        setErrors({});
        setFormError("");
        setSaved(false);
        setEditing(true);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting) return;

        const result = validateProfile({ name, phone });

        if (!result.ok) {
            setErrors(result.errors);
            setFormError("");
            document
                .getElementById(result.errors.name ? "profile-name" : "profile-phone")
                ?.focus();
            return;
        }

        // Send only what changed.
        const changes = {
            ...(result.values.name !== user.name && { name: result.values.name }),
            ...(result.values.phone !== user.phone && { phone: result.values.phone }),
        };

        if (Object.keys(changes).length === 0) {
            setEditing(false);
            return;
        }

        setErrors({});
        setFormError("");
        setSubmitting(true);

        try {
            const updated = await updateProfile(token, changes);

            dispatch(userUpdated(updated));
            setSaved(true);
            setEditing(false);
        } catch (error) {
            if (isSessionError(error)) {
                onExpired();
                return;
            }

            if (error instanceof ApiError && error.status === 409) {
                setErrors({ phone: "এই মোবাইল নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।" });
            } else {
                setFormError(describeError(error));
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section aria-labelledby="profile-details-heading" className={cardClass}>
            <div className="flex items-center justify-between gap-4">
                <h2
                    id="profile-details-heading"
                    className="text-lg font-bold text-foreground"
                >
                    আমার তথ্য
                </h2>

                {!editing && (
                    <button
                        type="button"
                        onClick={startEditing}
                        className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                    >
                        সম্পাদনা করুন
                    </button>
                )}
            </div>

            {editing ? (
                <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
                    <AuthField
                        id="profile-name"
                        name="name"
                        label="নাম"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        error={errors.name}
                    />

                    <AuthField
                        id="profile-phone"
                        name="phone"
                        type="tel"
                        label="মোবাইল নম্বর"
                        autoComplete="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        error={errors.phone}
                    />

                    {formError && (
                        <p
                            role="alert"
                            className="rounded-xl border border-error bg-card p-3 text-sm text-error"
                        >
                            {formError}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button type="submit" disabled={submitting} className={primaryButton}>
                            {submitting ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            disabled={submitting}
                            className={outlineButton}
                        >
                            বাতিল
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">নাম</dt>
                            <dd className="font-medium text-foreground">{user.name}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">ইমেইল</dt>
                            <dd className="break-all font-medium text-foreground">{user.email}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">মোবাইল</dt>
                            <dd className="font-medium text-foreground">{user.phone}</dd>
                        </div>
                    </dl>

                    {saved && (
                        <p role="status" className="mt-3 text-sm font-medium text-primary">
                            তথ্য সংরক্ষণ করা হয়েছে।
                        </p>
                    )}
                </>
            )}
        </section>
    );
}

// ---------- Shop ----------

function ShopCard({ token, onExpired }: { token: string; onExpired: () => void }) {
    // undefined: still loading. null: no shop yet.
    const [shop, setShop] = useState<Shop | null | undefined>(undefined);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetchMyShop(token)
            .then((result) => {
                if (!cancelled) setShop(result);
            })
            .catch((error) => {
                if (cancelled) return;

                if (isSessionError(error)) onExpired();
                else setFailed(true);
            });

        return () => {
            cancelled = true;
        };
    }, [token, onExpired]);

    return (
        <section aria-labelledby="profile-shop-heading" className={cardClass}>
            <h2 id="profile-shop-heading" className="text-lg font-bold text-foreground">
                আমার দোকান
            </h2>

            {failed ? (
                <p className="mt-3 text-sm text-muted-foreground">
                    দোকানের তথ্য আনা যায়নি। পরে আবার চেষ্টা করুন।
                </p>
            ) : shop === undefined ? (
                <p role="status" className="mt-3 text-sm text-muted-foreground">
                    লোড হচ্ছে…
                </p>
            ) : shop === null ? (
                <>
                    <p className="mt-3 text-sm text-muted-foreground">
                        আপনার এখনো কোনো দোকান নেই। চাইলে বিক্রেতা হিসেবে আবেদন করতে পারেন।
                    </p>

                    <Link href="/sell" className={`mt-4 ${primaryButton}`}>
                        বিক্রেতা হিসেবে আবেদন করুন
                    </Link>
                </>
            ) : (
                <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">দোকানের নাম</dt>
                        <dd className="font-medium text-foreground">{shop.shopName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">অবস্থা</dt>
                        <dd className="font-medium text-foreground">
                            {SHOP_STATUS_LABEL[shop.status] ?? shop.status}
                        </dd>
                    </div>
                </dl>
            )}
        </section>
    );
}

// ---------- Orders ----------

function MyOrders({ token, onExpired }: { token: string; onExpired: () => void }) {
    const [orders, setOrders] = useState<PlacedOrder[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetchMyOrders(token)
            .then((list) => {
                if (!cancelled) setOrders(list);
            })
            .catch((error) => {
                if (cancelled) return;

                if (isSessionError(error)) onExpired();
                else setFailed(true);
            });

        return () => {
            cancelled = true;
        };
    }, [token, onExpired]);

    return (
        <section aria-labelledby="profile-orders-heading" className={cardClass}>
            <div className="flex items-center justify-between gap-4">
                <h2
                    id="profile-orders-heading"
                    className="text-lg font-bold text-foreground"
                >
                    আমার অর্ডার
                </h2>

                <Link
                    href="/orders"
                    className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                    নম্বর দিয়ে খুঁজুন
                </Link>
            </div>

            {failed ? (
                <p className="mt-3 text-sm text-muted-foreground">
                    অর্ডারের তালিকা আনা যায়নি। পরে আবার চেষ্টা করুন।
                </p>
            ) : orders === null ? (
                <p role="status" className="mt-3 text-sm text-muted-foreground">
                    লোড হচ্ছে…
                </p>
            ) : orders.length === 0 ? (
                <>
                    <p className="mt-3 text-sm text-muted-foreground">
                        আপনি এখনো লগইন অবস্থায় কোনো অর্ডার করেননি।
                    </p>

                    <Link href="/products" className={`mt-4 ${primaryButton}`}>
                        কেনাকাটা শুরু করুন
                    </Link>
                </>
            ) : (
                <ul className="mt-4 divide-y divide-border">
                    {orders.slice(0, 10).map((order) => (
                        <li
                            key={order.orderNumber}
                            className="flex items-center justify-between gap-4 py-3 text-sm"
                        >
                            <div className="min-w-0">
                                <p className="font-semibold text-foreground">
                                    #{order.orderNumber}
                                </p>
                                <p className="text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                    {" · "}
                                    {order.items.length.toLocaleString("bn-BD")}টি পণ্য
                                </p>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="font-semibold text-foreground">৳{order.total}</p>
                                <p className="text-muted-foreground">
                                    {orderStatusLabel(order.status)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

// ---------- The page content ----------

export default function ProfileView() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectAuthStatus);
    const user = useAppSelector(selectAuthUser);
    const token = useAppSelector(selectAuthToken);

    // The saved login was rejected by the server. Forget it.
    const handleExpired = useCallback(() => {
        clearToken();
        dispatch(sessionEnded());
    }, [dispatch]);

    function handleLogout() {
        clearToken();
        dispatch(sessionEnded());
        router.push("/");
    }

    if (status === "loading") {
        return (
            <p role="status" className="py-10 text-center text-muted-foreground">
                লোড হচ্ছে…
            </p>
        );
    }

    if (status !== "authenticated" || !user || !token) {
        return (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <p className="text-lg font-semibold text-foreground">
                    প্রোফাইল দেখতে লগইন করুন
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    অ্যাকাউন্ট না থাকলে এক মিনিটেই খুলে নিতে পারেন।
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <Link href="/login?next=%2Fprofile" className={primaryButton}>
                        লগইন করুন
                    </Link>
                    <Link href="/signup?next=%2Fprofile" className={outlineButton}>
                        সাইন আপ করুন
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ProfileDetails user={user} token={token} onExpired={handleExpired} />
            <MyOrders token={token} onExpired={handleExpired} />
            <ShopCard token={token} onExpired={handleExpired} />

            <button type="button" onClick={handleLogout} className={outlineButton}>
                লগআউট
            </button>
        </div>
    );
}