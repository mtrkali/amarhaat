"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import {
    applyForShop,
    describeError,
    fetchMyShop,
    isSessionError,
    validateShopName,
    type Shop,
} from "../../lib/auth";
import { clearToken } from "../../lib/auth-storage";
import {
    selectAuthStatus,
    selectAuthToken,
    sessionEnded,
} from "../../lib/features/authSlice";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import AuthField from "./AuthField";

const cardClass = "rounded-2xl border border-border bg-card p-6";
const primaryButton =
    "inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60";
const outlineButton =
    "inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary";

const STATUS_TEXT: Record<Shop["status"], { title: string; text: string }> = {
    PENDING: {
        title: "আপনার আবেদন পর্যালোচনার অপেক্ষায় আছে",
        text: "অ্যাডমিন আবেদনটি দেখে সিদ্ধান্ত নেবেন। সিদ্ধান্ত হলে এখানে ও প্রোফাইলে নতুন অবস্থা দেখা যাবে।",
    },
    APPROVED: {
        title: "আপনার দোকান অনুমোদিত হয়েছে",
        text: "অভিনন্দন! আপনার দোকানের আবেদন অনুমোদন করা হয়েছে।",
    },
    SUSPENDED: {
        title: "আপনার দোকান আপাতত স্থগিত আছে",
        text: "এই দোকানটি এখন স্থগিত করা আছে।",
    },
};

function ApplyForm({
    token,
    onApplied,
    onExpired,
}: {
    token: string;
    onApplied: (shop: Shop) => void;
    onExpired: () => void;
}) {
    const [shopName, setShopName] = useState("");
    const [error, setError] = useState<string | undefined>();
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting) return;

        const result = validateShopName(shopName);

        if (!result.ok) {
            setError(result.error);
            setFormError("");
            document.getElementById("shop-name")?.focus();
            return;
        }

        setError(undefined);
        setFormError("");
        setSubmitting(true);

        try {
            onApplied(await applyForShop(token, result.shopName));
        } catch (caught) {
            if (isSessionError(caught)) {
                onExpired();
                return;
            }

            if (caught instanceof ApiError && caught.status === 409) {
                // Applied before (for example in another tab). Show the real status.
                try {
                    const existing = await fetchMyShop(token);

                    if (existing) {
                        onApplied(existing);
                        return;
                    }
                } catch {
                    // Fall through to the message below.
                }
            }

            setFormError(describeError(caught));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className={`${cardClass} space-y-4`}>
            <h2 className="text-lg font-bold text-foreground">দোকানের জন্য আবেদন করুন</h2>

            <AuthField
                id="shop-name"
                name="shopName"
                label="দোকানের নাম"
                autoComplete="organization"
                maxLength={60}
                hint="২ থেকে ৬০ অক্ষর।"
                value={shopName}
                onChange={(event) => setShopName(event.target.value)}
                error={error}
            />

            {formError && (
                <p
                    role="alert"
                    className="rounded-xl border border-error bg-card p-3 text-sm text-error"
                >
                    {formError}
                </p>
            )}

            <button type="submit" disabled={submitting} className={primaryButton}>
                {submitting ? "আবেদন পাঠানো হচ্ছে…" : "আবেদন পাঠান"}
            </button>
        </form>
    );
}

export default function SellerApply() {
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectAuthStatus);
    const token = useAppSelector(selectAuthToken);

    // undefined: still loading. null: no application yet.
    const [shop, setShop] = useState<Shop | null | undefined>(undefined);
    const [failed, setFailed] = useState(false);

    const handleExpired = useCallback(() => {
        clearToken();
        dispatch(sessionEnded());
    }, [dispatch]);

    useEffect(() => {
        if (status !== "authenticated" || !token) return;

        let cancelled = false;

        fetchMyShop(token)
            .then((result) => {
                if (!cancelled) setShop(result);
            })
            .catch((error) => {
                if (cancelled) return;

                if (isSessionError(error)) handleExpired();
                else setFailed(true);
            });

        return () => {
            cancelled = true;
        };
    }, [status, token, handleExpired]);

    if (status === "loading") {
        return (
            <p role="status" className="py-6 text-center text-muted-foreground">
                লোড হচ্ছে…
            </p>
        );
    }

    if (status !== "authenticated" || !token) {
        return (
            <div className={`${cardClass} text-center`}>
                <p className="text-lg font-semibold text-foreground">
                    আবেদন করতে আগে লগইন করুন
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    অ্যাকাউন্ট না থাকলে প্রথমে সাইন আপ করে নিন।
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <Link href="/login?next=%2Fsell" className={primaryButton}>
                        লগইন করুন
                    </Link>
                    <Link href="/signup?next=%2Fsell" className={outlineButton}>
                        সাইন আপ করুন
                    </Link>
                </div>
            </div>
        );
    }

    if (failed) {
        return (
            <div role="alert" className={`${cardClass} text-center`}>
                <p className="text-lg font-semibold text-foreground">
                    তথ্য লোড করা যায়নি
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    কিছুক্ষণ পর পেজটি রিফ্রেশ করুন।
                </p>
            </div>
        );
    }

    if (shop === undefined) {
        return (
            <p role="status" className="py-6 text-center text-muted-foreground">
                লোড হচ্ছে…
            </p>
        );
    }

    if (shop === null) {
        return <ApplyForm token={token} onApplied={setShop} onExpired={handleExpired} />;
    }

    const info = STATUS_TEXT[shop.status];

    return (
        <section aria-labelledby="shop-status-heading" className={cardClass}>
            <h2 id="shop-status-heading" className="text-lg font-bold text-foreground">
                {info?.title ?? "আপনার আবেদন"}
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">দোকানের নাম</dt>
                    <dd className="font-medium text-foreground">{shop.shopName}</dd>
                </div>
            </dl>

            {info && <p className="mt-4 text-sm text-muted-foreground">{info.text}</p>}

            <Link href="/profile" className={`mt-4 ${outlineButton}`}>
                প্রোফাইলে যান
            </Link>
        </section>
    );
}