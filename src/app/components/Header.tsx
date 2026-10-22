"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { selectCartCount } from "../../lib/features/cartSlice";
import { useAppSelector } from "../../lib/hooks";
import DesktopNav from "./DesktopNav";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

// Menu for mobile and tablet (below lg). Large screens use DesktopNav instead.
// TODO: some of these pages don't exist yet. Add them as the app grows.
const menuLinks = [
    { href: "/", label: "হোম" },
    { href: "/categories", label: "ক্যাটাগরি" },
    { href: "/orders", label: "আমার অর্ডার" },
    { href: "/profile", label: "আমার অ্যাকাউন্ট" },
    { href: "/sell", label: "বিক্রেতা হিসেবে যোগ দিন" },
    { href: "/help", label: "সাহায্য ও FAQ" },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const cartCount = useAppSelector(selectCartCount);
    const router = useRouter();

    // Close the menu with the Escape key.
    useEffect(() => {
        if (!menuOpen) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [menuOpen]);

    // Go to the search results on /products. An empty box does nothing.
    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.currentTarget;
        const input = form.elements.namedItem("q") as HTMLInputElement;
        const query = input.value.trim().replace(/\s+/g, " ");

        if (!query) return;

        // Hides the keyboard on phones.
        input.blur();
        router.push(`/products?q=${encodeURIComponent(query)}`);
    }

    const cartLabel =
        cartCount > 0 ? `কার্ট, ${cartCount}টি পণ্য` : "কার্ট";

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-card pt-[env(safe-area-inset-top)] text-card-foreground">
            {/*
              Mobile: logo + actions on the first row, search on its own row.
              Large screens: logo, search (centered), actions in one row.
            */}
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-6 lg:gap-x-6 lg:px-8">
                <Logo className="order-1" />

                {/* Product Search */}
                <form
                    role="search"
                    action="/products"
                    onSubmit={handleSearch}
                    className="order-3 basis-full lg:order-2 lg:mx-auto lg:max-w-xl lg:flex-1 lg:basis-auto"
                >
                    <label htmlFor="product-search" className="sr-only">
                        পণ্য খুঁজুন
                    </label>

                    <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

                        <input
                            id="product-search"
                            type="search"
                            name="q"
                            maxLength={100}
                            enterKeyHint="search"
                            autoComplete="off"
                            placeholder="কী খুঁজছেন? (পণ্য, ক্যাটাগরি...)"
                            className="h-12 w-full min-w-0 rounded-xl border border-border bg-input pl-12 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25"
                        />
                    </div>
                </form>

                {/* Header Actions */}
                <div className="order-2 ml-auto flex items-center gap-1 lg:order-3 lg:ml-0">
                    {/* Location */}
                    <button
                        type="button"
                        aria-label="এলাকা বদলান, বর্তমান এলাকা Feni"
                        className="flex h-11 items-center gap-1 rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        Feni
                        <ChevronDown className="size-4 text-muted-foreground" />
                    </button>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        aria-label={cartLabel}
                        className="relative flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
                    >
                        <ShoppingCart className="size-6" strokeWidth={1.8} />

                        {cartCount > 0 && (
                            <span
                                aria-hidden="true"
                                className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-badge px-1 text-[11px] font-bold leading-5 text-badge-foreground"
                            >
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Account (large screens; mobile has it in the menu and BottomNav) */}
                    <Link
                        href="/profile"
                        aria-label="আমার অ্যাকাউন্ট"
                        className="hidden size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:flex"
                    >
                        <User className="size-6" strokeWidth={1.8} />
                    </Link>

                    {/* Menu (hidden on large screens, where DesktopNav takes over) */}
                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={menuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
                        aria-expanded={menuOpen}
                        aria-controls="site-menu"
                        className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
                    >
                        {menuOpen ? (
                            <X className="size-6" strokeWidth={1.8} />
                        ) : (
                            <Menu className="size-6" strokeWidth={1.8} />
                        )}
                    </button>
                </div>
            </div>

            {/* Desktop navigation links (lg and up) */}
            <DesktopNav />

            {/*
              Menu panel. It stays mounted (hidden when closed) so ThemeToggle
              keeps its state instead of re-reading localStorage on every open.
            */}
            <div
                id="site-menu"
                hidden={!menuOpen}
                className="absolute inset-x-0 top-full max-h-[calc(100dvh-8rem)] overflow-y-auto border-b border-border bg-card shadow-lg lg:hidden"
            >
                <nav
                    aria-label="মেনু"
                    className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6 lg:px-8"
                >
                    {menuLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="mt-2 flex items-center justify-between border-t border-border px-3 pt-3">
                        <span className="text-sm text-muted-foreground">
                            থিম
                        </span>
                        <ThemeToggle />
                    </div>
                </nav>
            </div>
        </header>
    );
}