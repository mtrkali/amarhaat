"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

const inputClass =
    "h-12 w-full rounded-xl border bg-input px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25";

type AuthFieldProps = {
    id: string;
    label: string;
    error?: string;
    hint?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

// One labelled input with its error message. A password field gets a show/hide button.
export default function AuthField({
    id,
    label,
    error,
    hint,
    type = "text",
    ...input
}: AuthFieldProps) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    const showHint = Boolean(hint) && !error;

    const describedBy =
        [error ? `${id}-error` : null, showHint ? `${id}-hint` : null]
            .filter(Boolean)
            .join(" ") || undefined;

    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-foreground"
            >
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={isPassword && visible ? "text" : type}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    className={`${inputClass} ${error ? "border-error" : "border-border"} ${isPassword ? "pr-12" : ""}`}
                    {...input}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((value) => !value)}
                        aria-label={visible ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                        aria-pressed={visible}
                        className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {visible ? (
                            <EyeOff aria-hidden="true" className="size-5" />
                        ) : (
                            <Eye aria-hidden="true" className="size-5" />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-sm text-error">
                    {error}
                </p>
            )}

            {showHint && (
                <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
                    {hint}
                </p>
            )}
        </div>
    );
}