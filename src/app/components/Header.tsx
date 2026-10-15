import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]">
            <div className="mx-auto grid min-h-20 w-full max-w-7xl grid-cols-1 items-center gap-4 px-4 py-3 sm:px-6 lg:grid-cols-[auto_minmax(200px,1fr)_auto] lg:gap-6 lg:px-8">
                {/* Brand Logo */}
                <Link
                    href="/"
                    aria-label="Amar Haat Home"
                    className="flex items-center gap-2 justify-self-start"
                >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--primary)] text-2xl text-[var(--primary-foreground)]">
                        🛍️
                    </span>

                    <span className="text-xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-2xl">
                        Amar <span className="text-[var(--primary)]">Haat</span>
                    </span>
                </Link>

                {/* Product Search */}
                <form
                    role="search"
                    className="flex h-11 w-full min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--input-background)] focus-within:border-[var(--focus-ring)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)]/20 lg:mx-auto lg:max-w-xl"
                >
                    <label htmlFor="product-search" className="sr-only">
                        পণ্য খুঁজুন
                    </label>

                    <input
                        id="product-search"
                        type="search"
                        name="search"
                        placeholder="আপনি কী খুঁজছেন?"
                        autoComplete="off"
                        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] sm:px-4"
                    />

                    <button
                        type="submit"
                        aria-label="পণ্য খুঁজুন"
                        className="flex shrink-0 items-center justify-center gap-2 bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)] sm:px-4"
                    >
                        <svg
                            width="19"
                            height="19"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-4-4" />
                        </svg>

                        <span className="hidden sm:inline">খুঁজুন</span>
                    </button>
                </form>

                {/* Header Actions */}
                <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
                    {/* Account */}
                    <button
                        type="button"
                        aria-label="আমার অ্যাকাউন্ট"
                        className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                        </svg>

                        <span className="text-[10px] font-medium sm:text-xs">
                            অ্যাকাউন্ট
                        </span>
                    </button>

                    {/* Cart */}
                    <button
                        type="button"
                        aria-label="শপিং কার্ট"
                        className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6" />
                            <circle cx="10" cy="21" r="1" />
                            <circle cx="18" cy="21" r="1" />
                        </svg>

                        <span className="text-[10px] font-medium sm:text-xs">
                            কার্ট
                        </span>
                    </button>

                    {/* Theme Toggle */}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}