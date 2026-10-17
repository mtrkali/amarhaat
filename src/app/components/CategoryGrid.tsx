import Image from "next/image";
import Link from "next/link";
import { Ellipsis } from "lucide-react";
import { categories } from "../../lib/mock-data";
import SectionHeader from "./SectionHeader";

const tileClass =
    "flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-1.5 text-center transition-colors hover:border-primary group";

const labelClass =
    "text-[11px] font-medium leading-tight text-foreground sm:text-sm";

export default function CategoryGrid() {
    return (
        <section aria-labelledby="categories-heading">
            <SectionHeader
                id="categories-heading"
                title="জনপ্রিয় ক্যাটাগরি"
                href="/categories"
            />

            <ul className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8">
                {categories.map((category) => (
                    <li key={category.id}>
                        <Link href={category.href} className={tileClass}>
                            {category.image ? (
                                <span className="relative size-10 sm:size-14">
                                    <Image
                                        src={category.image}
                                        alt=""
                                        fill
                                        sizes="56px"
                                        className="object-contain  rounded-lg group-hover:scale-120 transition-transform duration-300"
                                    />
                                </span>
                            ) : (
                                <span
                                    aria-hidden="true"
                                    className="text-3xl sm:text-4xl"
                                >
                                    {category.emoji}
                                </span>
                            )}

                            <span className={labelClass}>{category.name}</span>
                        </Link>
                    </li>
                ))}

                <li>
                    <Link href="/categories" className={tileClass}>
                        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground sm:size-12">
                            <Ellipsis className="size-6" />
                        </span>
                        <span className={labelClass}>আরও দেখুন</span>
                    </Link>
                </li>
            </ul>
        </section>
    );
}