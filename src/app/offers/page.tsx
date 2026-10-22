import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, type Product } from "../../lib/catalog";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";
import ProductGrid from "../components/ProductGrid";

export const metadata: Metadata = {
    title: "অফার ও ছাড় | Amar Haat",
    description: "ছাড়ের দামে পাওয়া স্থানীয় পণ্য।",
};

// A product is "on offer" when it has an old price that is higher than the current price.
function isOffer(product: Product) {
    return product.oldPrice !== undefined && product.oldPrice > product.price;
}

// Fraction of the old price that is saved. The biggest saving comes first.
function saving(product: Product) {
    return product.oldPrice ? (product.oldPrice - product.price) / product.oldPrice : 0;
}

export default async function OffersPage() {
    let offers: Product[] = [];
    let failed = false;

    try {
        const products = await getProducts();

        offers = products.filter(isOffer).sort((a, b) => saving(b) - saving(a));
    } catch {
        failed = true;
    }

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "অফার ও ছাড়" }]}
                title="অফার ও ছাড়"
                description="ছাড়ের দামে পাওয়া স্থানীয় পণ্য। সবচেয়ে বেশি ছাড়ের পণ্য আগে।"
            />

            {failed ? (
                <LoadError />
            ) : offers.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <p className="text-foreground">এই মুহূর্তে কোনো অফার নেই।</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        নতুন অফার এলে এখানে দেখা যাবে।
                    </p>

                    <Link
                        href="/products"
                        className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                        সব পণ্য দেখুন
                    </Link>
                </div>
            ) : (
                <>
                    <p className="mb-4 text-sm text-muted-foreground">
                        {offers.length.toLocaleString("bn-BD")}টি পণ্যে ছাড়
                    </p>

                    <ProductGrid products={offers} />
                </>
            )}
        </main>
    );
}