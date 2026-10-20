import type { Metadata } from "next";
import { getProducts, type Product } from "../../lib/catalog";
import CategoryChips from "../components/CategoryChips";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";
import ProductGrid from "../components/ProductGrid";

export const metadata: Metadata = {
    title: "সব পণ্য | Amar Haat",
    description: "ফেনীর স্থানীয় দোকান ও কৃষকের সব পণ্য এক জায়গায়।",
};

export default async function ProductsPage() {
    let products: Product[] = [];
    let failed = false;

    try {
        products = await getProducts();
    } catch {
        failed = true;
    }

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "সব পণ্য" }]}
                title="সব পণ্য"
                description="স্থানীয় দোকান ও কৃষকের পণ্য, সাশ্রয়ী দামে।"
            />

            <CategoryChips />

            {failed ? (
                <LoadError />
            ) : (
                <>
                    <p className="mb-4 text-sm text-muted-foreground">
                        {products.length.toLocaleString("bn-BD")}টি পণ্য
                    </p>

                    <ProductGrid products={products} />
                </>
            )}
        </main>
    );
}
