"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
    loginErrorMessage,
    loginRequest,
    validateLogin,
    type LoginErrors,
} from "../../lib/auth";
import { saveToken } from "../../lib/auth-storage";
import { selectAuthStatus, sessionStarted } from "../../lib/features/authSlice";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import AuthField from "./AuthField";

type LoginFormProps = {
    // Where to go after login. Already checked on the server (see safeRedirectPath).
    next: string;
};

export default function LoginForm({ next }: LoginFormProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectAuthStatus);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<LoginErrors>({});
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Right after login, and also for someone who is already logged in.
    useEffect(() => {
        if (status === "authenticated") {
            router.replace(next);
        }
    }, [status, next, router]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting) return;

        const result = validateLogin(email, password);

        if (!result.ok) {
            setErrors(result.errors);
            setFormError("");
            document
                .getElementById(result.errors.email ? "login-email" : "login-password")
                ?.focus();
            return;
        }

        setErrors({});
        setFormError("");
        setSubmitting(true);

        try {
            const session = await loginRequest(result.email, result.password);

            saveToken(session.token);
            dispatch(sessionStarted(session));
            // The effect above moves the visitor on.
        } catch (error) {
            setFormError(loginErrorMessage(error));
            setSubmitting(false);
        }
    }

    if (status === "authenticated") {
        return (
            <p role="status" className="text-center text-muted-foreground">
                আপনি লগইন করা আছেন। নিয়ে যাওয়া হচ্ছে…
            </p>
        );
    }

    const signupHref =
        next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;

    return (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <AuthField
                    id="login-email"
                    name="email"
                    type="email"
                    label="ইমেইল"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    error={errors.email}
                />

                <AuthField
                    id="login-password"
                    name="password"
                    type="password"
                    label="পাসওয়ার্ড"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
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
                    {submitting ? "লগইন হচ্ছে…" : "লগইন করুন"}
                </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
                অ্যাকাউন্ট নেই?{" "}
                <Link
                    href={signupHref}
                    className="font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                    সাইন আপ করুন
                </Link>
            </p>
        </div>
    );
}