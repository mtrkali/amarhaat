import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SectionHeaderProps = {
    id: string;
    title: string;
    href?: string;
};

export default function SectionHeader({ id, title, href }: SectionHeaderProps) {
    return (
        <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id={id} className="text-xl font-bold text-foreground md:text-2xl">
                {title}
            </h2>

            {href && (
                <Link
                    href={href}
                    aria-label={`${title}: সব দেখুন`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                    সব দেখুন
                    <ArrowRight className="size-4" />
                </Link>
            )}
        </div>
    );
}