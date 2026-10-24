"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { selectAuthUser } from "../../lib/features/authSlice";
import { useAppSelector } from "../../lib/hooks";

// Large screens only (lg and up). Below lg the header menu and BottomNav carry navigation.
const primaryLinks = [
    { href: "/", label: "হোম" },
    { href: "/categories", label: "ক্যাটাগরি" },
    { href: "/products", label: "সব পণ্য" },
    { href: "/orders", label: "আমার অর্ডার" },
];

const secondaryLinks = [
    { href: "/sell", label: "বিক্রেতা হিসেবে যোগ দিন" },
    { href: "/help", label: "সাহায্য ও FAQ" },
];

export default function DesktopNav() {
    const pathname = usePathname();
    const user = useAppSelector(selectAuthUser);
    const sellerLinks = user?.role === "SELLER"
        ? [{ href: "/seller/dashboard", label: "Seller dashboard" }, ...secondaryLinks]
        : secondaryLinks;
    const accountLinks = user?.role === "ADMIN"
        ? [{ href: "/admin", label: "Admin Panel" }, ...sellerLinks]
        : sellerLinks;

    function isActive(href: string) {
        return href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <nav
            aria-label="প্রধান মেনু"
            className="hidden border-t border-border lg:block"
        >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-8">
                <ul className="flex items-center gap-1">
                    {primaryLinks.map((link) => {
                        const active = isActive(link.href);

                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex h-12 items-center border-b-2 px-4 text-sm transition-colors ${active
                                        ? "border-primary font-semibold text-primary"
                                        : "border-transparent font-medium text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex items-center gap-5">
                    {accountLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={isActive(link.href) ? "page" : undefined}
                            className={`text-sm transition-colors ${isActive(link.href)
                                ? "font-semibold text-primary"
                                : "font-medium text-muted-foreground hover:text-primary"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
