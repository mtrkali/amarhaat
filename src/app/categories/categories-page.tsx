import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
    getCategories,
    getProducts,
    type Category,
    type Product,
} from "../../lib/catalog";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";

export const metadata: Metadata = {
    title: "সব ক্যাটাগরি | Amar Haat",
    description: "ফেনীর স্থানীয় পণ্যের সব ক্যাটাগরি দেখুন।",
};

export default async function CategoriesPage() {
    let categories: Category[] = [];
    let products: Product[] = [];
    let failed = false;

    try {
        [categories, products] = await Promise.all([
            getCategories(),
            getProducts(),
        ]);
    } catch {
        failed = true;
    }

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "ক্যাটাগরি" }]}
                title="সব ক্যাটাগরি"
                description="আপনার প্রয়োজনের পণ্য ক্যাটাগরি ধরে খুঁজে নিন।"
            />

            {failed ? (
                <LoadError />
            ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                    {categories.map((category) => {
                        const count = products.filter(
                            (product) => product.categoryId === category.id,
                        ).length;

                        return (
                            <li key={category.id}>
                                <Link
                                    href={category.href}
                                    className="flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center transition-colors hover:border-primary"
                                >
                                    {category.image ? (
                                        <span className="relative size-20 sm:size-24">
                                            <Image
                                                src={category.image}
                                                alt=""
                                                fill
                                                sizes="96px"
                                                className="object-contain"
                                            />
                                        </span>
                                    ) : (
                                        <span
                                            aria-hidden="true"
                                            className="text-5xl sm:text-6xl"
                                        >
                                            {category.emoji}
                                        </span>
                                    )}

                                    <span className="text-sm leading-snug sm:text-base">
                                        <span className="block font-semibold text-foreground">
                                            {category.name}
                                        </span>
                                        <span className="block text-muted-foreground">
                                            {count.toLocaleString("bn-BD")}টি পণ্য
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </main>
    );
}
