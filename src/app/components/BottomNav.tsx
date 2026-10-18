"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    House,
    LayoutGrid,
    Receipt,
    ShoppingCart,
    User,
} from "lucide-react";
import { selectCartCount } from "../../lib/features/cartSlice";
import { useAppSelector } from "../../lib/hooks";

// TODO: /orders and /profile are still to be built.
const navItems = [
    { href: "/", label: "হোম", Icon: House },
    { href: "/categories", label: "ক্যাটাগরি", Icon: LayoutGrid },
    { href: "/cart", label: "কার্ট", Icon: ShoppingCart },
    { href: "/orders", label: "অর্ডার", Icon: Receipt },
    { href: "/profile", label: "প্রোফাইল", Icon: User },
];

export default function BottomNav() {
    const pathname = usePathname();
    const cartCount = useAppSelector(selectCartCount);

    function isActive(href: string) {
        return href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        // Mobile only. From the md breakpoint the header carries navigation.
        <nav
            aria-label="প্রধান নেভিগেশন"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
        >
            <ul className="mx-auto grid max-w-md grid-cols-5">
                {navItems.map(({ href, label, Icon }) => {
                    const active = isActive(href);
                    const showBadge = href === "/cart" && cartCount > 0;

                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                aria-current={active ? "page" : undefined}
                                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors ${active
                                        ? "font-semibold text-primary"
                                        : "font-medium text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <span className="relative">
                                    <Icon className="size-6" strokeWidth={1.8} />

                                    {showBadge && (
                                        <span
                                            aria-hidden="true"
                                            className="absolute -right-2 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-badge px-1 text-[10px] font-bold leading-4 text-badge-foreground"
                                        >
                                            {cartCount > 99 ? "99+" : cartCount}
                                        </span>
                                    )}
                                </span>

                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}