import Link from "next/link";
import { MapPin } from "lucide-react";
import Logo from "./Logo";

// TODO: these pages do not exist yet.
const quickLinks = [
    { href: "/", label: "হোম" },
    { href: "/categories", label: "ক্যাটাগরি" },
    { href: "/cart", label: "কার্ট" },
    { href: "/orders", label: "অর্ডার" },
];

const helpLinks = [
    { href: "/help", label: "FAQ" },
    { href: "/delivery-policy", label: "ডেলিভারি নীতি" },
    { href: "/return-policy", label: "রিটার্ন নীতি" },
    { href: "/privacy", label: "গোপনীয়তা নীতি" },
];

// TODO: replace "#" with the real social page URLs.
const socialLinks = [
    { href: "#", label: "Facebook" },
    { href: "#", label: "YouTube" },
    { href: "#", label: "Instagram" },
];

function LinkColumn({
    title,
    links,
}: {
    title: string;
    links: { href: string; label: string }[];
}) {
    return (
        <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
                {title}
            </h2>

            <ul className="space-y-2 text-sm">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link
                            href={link.href}
                            className="text-muted-foreground transition-colors hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Footer() {
    return (
        <footer className="border-t border-border bg-card text-card-foreground">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <Logo />
                        <p className="mt-3 text-sm text-muted-foreground">
                            Local People. Local Products. Better Tomorrow.
                        </p>
                    </div>

                    <LinkColumn title="দ্রুত লিংক" links={quickLinks} />
                    <LinkColumn title="সাহায্য" links={helpLinks} />
                    <LinkColumn title="আমাদের সাথে থাকুন" links={socialLinks} />
                </div>

                <div className="mt-8 flex flex-col gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} Amar Haat. সর্বস্বত্ব সংরক্ষিত।</p>

                    <p className="flex items-center gap-1">
                        <MapPin aria-hidden="true" className="size-3.5" />
                        ফেনী, বাংলাদেশ
                    </p>
                </div>
            </div>
        </footer>
    );
}