import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
    getCategories,
    getProducts,
    type Category,
    type Product,
} from "../../../lib/catalog";
import CategoryChips from "../../components/CategoryChips";
import LoadError from "../../components/LoadError";
import PageHeading from "../../components/PageHeading";
import ProductGrid from "../../components/ProductGrid";

type CategoryPageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({
    params,
}: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategories()
        .then((list) => list.find((item) => item.id === slug))
        .catch(() => undefined);

    if (!category) {
        return { title: "ক্যাটাগরি | Amar Haat" };
    }

    return {
        title: `${category.name} | Amar Haat`,
        description: `${category.name} ক্যাটাগরির পণ্য দেখুন।`,
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;

    let category: Category | undefined;
    let items: Product[] = [];
    let failed = false;

    try {
        const categories = await getCategories();
        category = categories.find((item) => item.id === slug);

        if (category) {
            items = await getProducts(category.id);
        }
    } catch {
        failed = true;
    }

    if (failed) {
        return (
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
                <LoadError />
            </main>
        );
    }

    if (!category) {
        notFound();
    }

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={[
                    { label: "হোম", href: "/" },
                    { label: "ক্যাটাগরি", href: "/categories" },
                    { label: category.name },
                ]}
                title={category.name}
            />

            <CategoryChips activeId={category.id} />

            <p className="mb-4 text-sm text-muted-foreground">
                {items.length.toLocaleString("bn-BD")}টি পণ্য
            </p>

            <ProductGrid products={items} />
        </main>
    );
}
