import Link from "next/link";
import { Leaf } from "lucide-react";

type LogoProps = {
    className?: string;
};

export default function Logo({ className = "" }: LogoProps) {
    return (
        <Link
            href="/"
            aria-label="Amar Haat হোম"
            className={`flex items-center gap-2 ${className}`}
        >
            <Leaf className="size-8 shrink-0 text-primary" strokeWidth={2.2} />

            <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                Amar <span className="text-primary">Haat</span>
            </span>
        </Link>
    );
}