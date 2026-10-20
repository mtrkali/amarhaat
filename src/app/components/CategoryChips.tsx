import Link from "next/link";
import { getCategories } from "../../lib/catalog";

type CategoryChipsProps = {
    // The id of the current category. Leave it out on the "all products" page.
    activeId?: string;
};

export default async function CategoryChips({ activeId }: CategoryChipsProps) {
    // If the server cannot be reached, the "all products" chip still shows.
    const categories = await getCategories().catch(() => []);

    const chips = [
        { id: "all", name: "সব পণ্য", href: "/products" },
        ...categories.map((category) => ({
            id: category.id,
            name: category.name,
            href: category.href,
        })),
    ];

    const currentId = activeId ?? "all";

    return (
        <nav
            aria-label="ক্যাটাগরি অনুযায়ী পণ্য"
            className="-mx-4 mb-6 sm:-mx-6 lg:mx-0"
        >
            {/* Phones: swipe sideways. lg and up: wrap onto several lines. */}
            <ul className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:px-6 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
                {chips.map((chip) => {
                    const active = chip.id === currentId;

                    return (
                        <li key={chip.id} className="shrink-0">
                            <Link
                                href={chip.href}
                                aria-current={active ? "page" : undefined}
                                className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors ${active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card text-foreground hover:border-primary"
                                    }`}
                            >
                                {chip.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}