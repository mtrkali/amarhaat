import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
    categories,
    getCategory,
    getProductsByCategory,
} from "../../../lib/mock-data";
import CategoryChips from "../../components/CategoryChips";
import PageHeading from "../../components/PageHeading";
import ProductGrid from "../../components/ProductGrid";

type CategoryPageProps = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    return categories.map((category) => ({ slug: category.id }));
}

export async function generateMetadata({
    params,
}: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = getCategory(slug);

    if (!category) {
        return { title: "ক্যাটাগরি পাওয়া যায়নি | Amar Haat" };
    }

    return {
        title: `${category.name} | Amar Haat`,
        description: `${category.name} ক্যাটাগরির পণ্য দেখুন।`,
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;
    const category = getCategory(slug);

    if (!category) {
        notFound();
    }

    const items = getProductsByCategory(category.id);

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