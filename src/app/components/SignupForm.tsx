"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import {
    SIGNUP_FIELD_ORDER,
    describeError,
    loginRequest,
    registerRequest,
    validateSignup,
    type SignupErrors,
    type SignupValues,
} from "../../lib/auth";
import { saveToken } from "../../lib/auth-storage";
import { selectAuthStatus, sessionStarted } from "../../lib/features/authSlice";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import AuthField from "./AuthField";

type SignupFormProps = {
    // Where to go after sign up. Already checked on the server (see safeRedirectPath).
    next: string;
};

const emptyValues: SignupValues = { name: "", email: "", phone: "", password: "" };

export default function SignupForm({ next }: SignupFormProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectAuthStatus);

    const [values, setValues] = useState<SignupValues>(emptyValues);
    const [errors, setErrors] = useState<SignupErrors>({});
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            router.replace(next);
        }
    }, [status, next, router]);

    function setField(field: keyof SignupValues, value: string) {
        setValues((current) => ({ ...current, [field]: value }));
    }

    function focusFirst(found: SignupErrors) {
        const first = SIGNUP_FIELD_ORDER.find((field) => found[field]);

        if (first) document.getElementById(`signup-${first}`)?.focus();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting) return;

        const result = validateSignup(values);

        if (!result.ok) {
            setErrors(result.errors);
            setFormError("");
            focusFirst(result.errors);
            return;
        }

        setErrors({});
        setFormError("");
        setSubmitting(true);

        try {
            await registerRequest(result.values);
        } catch (error) {
            if (error instanceof ApiError && error.status === 409) {
                const found: SignupErrors = /email/i.test(error.message)
                    ? { email: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে। লগইন করুন।" }
                    : { phone: "এই মোবাইল নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।" };

                setErrors(found);
                focusFirst(found);
            } else if (error instanceof ApiError && error.status === 400) {
                setFormError("আপনার দেওয়া তথ্যে সমস্যা আছে। ফর্মের তথ্যগুলো আবার দেখে নিন।");
            } else {
                setFormError(describeError(error));
            }

            setSubmitting(false);
            return;
        }

        // The account exists now. Log in with the same details, so there is no second form.
        try {
            const session = await loginRequest(result.values.email, result.values.password);

            saveToken(session.token);
            dispatch(sessionStarted(session));
            // The effect above moves the visitor on.
        } catch {
            const loginHref =
                next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

            router.replace(loginHref);
        }
    }

    if (status === "authenticated") {
        return (
            <p role="status" className="text-center text-muted-foreground">
                আপনি লগইন করা আছেন। নিয়ে যাওয়া হচ্ছে…
            </p>
        );
    }

    const loginHref =
        next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

    return (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <AuthField
                    id="signup-name"
                    name="name"
                    label="আপনার নাম"
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => setField("name", event.target.value)}
                    error={errors.name}
                />

                <AuthField
                    id="signup-email"
                    name="email"
                    type="email"
                    label="ইমেইল"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="name@example.com"
                    value={values.email}
                    onChange={(event) => setField("email", event.target.value)}
                    error={errors.email}
                />

                <AuthField
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    label="মোবাইল নম্বর"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="01XXXXXXXXX"
                    value={values.phone}
                    onChange={(event) => setField("phone", event.target.value)}
                    error={errors.phone}
                />

                <AuthField
                    id="signup-password"
                    name="password"
                    type="password"
                    label="পাসওয়ার্ড"
                    autoComplete="new-password"
                    hint="কমপক্ষে ৮ অক্ষর। ইংরেজি বড় হাতের অক্ষর, ছোট হাতের অক্ষর ও একটি সংখ্যা থাকতে হবে।"
                    value={values.password}
                    onChange={(event) => setField("password", event.target.value)}
                    error={errors.password}
                />

                {formError && (
                    <p
                        role="alert"
                        className="rounded-xl border border-error bg-card p-3 text-sm text-error"
                    >
                        {formError}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "অ্যাকাউন্ট খোলা হচ্ছে…" : "সাইন আপ করুন"}
                </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
                আগেই অ্যাকাউন্ট আছে?{" "}
                <Link
                    href={loginHref}
                    className="font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                    লগইন করুন
                </Link>
            </p>
        </div>
    );
}