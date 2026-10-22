import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, type Product } from "../../lib/catalog";
import CategoryChips from "../components/CategoryChips";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";
import ProductGrid from "../components/ProductGrid";

type ProductsPageProps = {
    searchParams: Promise<{ q?: string | string[] }>;
};

// Reads the search text from the address (/products?q=...). Empty means "no search".
async function readSearch(searchParams: ProductsPageProps["searchParams"]) {
    const { q } = await searchParams;
    const value = Array.isArray(q) ? q[0] : q;

    return (value ?? "").trim().replace(/\s+/g, " ").slice(0, 100);
}

export async function generateMetadata({
    searchParams,
}: ProductsPageProps): Promise<Metadata> {
    const search = await readSearch(searchParams);

    if (search) {
        return {
            title: `“${search}” খোঁজার ফলাফল | Amar Haat`,
            // Search result pages should not show up in Google.
            robots: { index: false },
        };
    }

    return {
        title: "সব পণ্য | Amar Haat",
        description: "ফেনীর স্থানীয় দোকান ও কৃষকের সব পণ্য এক জায়গায়।",
    };
}

const buttonClass =
    "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover";

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const search = await readSearch(searchParams);

    let products: Product[] = [];
    let failed = false;

    try {
        products = await getProducts(undefined, search || undefined);
    } catch {
        failed = true;
    }

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={
                    search
                        ? [
                            { label: "হোম", href: "/" },
                            { label: "সব পণ্য", href: "/products" },
                            { label: "খোঁজার ফলাফল" },
                        ]
                        : [{ label: "হোম", href: "/" }, { label: "সব পণ্য" }]
                }
                title={search ? `“${search}” খোঁজার ফলাফল` : "সব পণ্য"}
                description={
                    search
                        ? undefined
                        : "স্থানীয় দোকান ও কৃষকের পণ্য, সাশ্রয়ী দামে।"
                }
            />

            {/* While searching, the category chips would drop the search, so they are hidden. */}
            {!search && <CategoryChips />}

            {failed ? (
                <LoadError />
            ) : search && products.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <p className="text-foreground">
                        “{search}” নামে কোনো পণ্য পাওয়া যায়নি।
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        অন্য শব্দ দিয়ে খুঁজুন, অথবা ক্যাটাগরি দেখুন।
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <Link href="/products" className={buttonClass}>
                            সব পণ্য দেখুন
                        </Link>
                        <Link href="/categories" className={buttonClass}>
                            ক্যাটাগরি দেখুন
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <p className="mb-4 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                        {products.length.toLocaleString("bn-BD")}টি পণ্য
                        {search && (
                            <Link
                                href="/products"
                                className="font-semibold text-primary transition-colors hover:text-primary-hover"
                            >
                                খোঁজা মুছুন
                            </Link>
                        )}
                    </p>

                    <ProductGrid products={products} />
                </>
            )}
        </main>
    );
}