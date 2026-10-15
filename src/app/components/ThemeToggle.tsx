"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("amar-haat-theme");

        let initialTheme: Theme;

        if (savedTheme === "light" || savedTheme === "dark") {
            initialTheme = savedTheme;
        } else {
            initialTheme = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches
                ? "dark"
                : "light";
        }

        setTheme(initialTheme);
        document.documentElement.dataset.theme = initialTheme;
        setMounted(true);
    }, []);

    function toggleTheme() {
        const nextTheme: Theme = theme === "light" ? "dark" : "light";

        setTheme(nextTheme);
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem("amar-haat-theme", nextTheme);
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            disabled={!mounted}
            aria-label={
                theme === "light"
                    ? "Switch to dark theme"
                    : "Switch to light theme"
            }
            title={
                theme === "light"
                    ? "Switch to dark theme"
                    : "Switch to light theme"
            }
            className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:cursor-wait disabled:opacity-70 sm:text-sm"
        >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
    );
}