import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = {
    label: string;
    href?: string;
};

type PageHeadingProps = {
    crumbs: Crumb[];
    title: string;
    description?: string;
};

export default function PageHeading({
    crumbs,
    title,
    description,
}: PageHeadingProps) {
    return (
        <div className="mb-6">
            <nav aria-label="পেজের পথ">
                <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                    {crumbs.map((crumb, index) => {
                        const isLast = index === crumbs.length - 1;

                        return (
                            <li
                                key={crumb.label}
                                className="flex items-center gap-1"
                            >
                                {crumb.href && !isLast ? (
                                    <Link
                                        href={crumb.href}
                                        className="transition-colors hover:text-primary"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span
                                        aria-current={isLast ? "page" : undefined}
                                        className={
                                            isLast
                                                ? "font-medium text-foreground"
                                                : undefined
                                        }
                                    >
                                        {crumb.label}
                                    </span>
                                )}

                                {!isLast && (
                                    <ChevronRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>

            <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">
                {title}
            </h1>

            {description && (
                <p className="mt-1 text-sm text-muted-foreground md:text-base">
                    {description}
                </p>
            )}
        </div>
    );
}