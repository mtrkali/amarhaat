import Link from "next/link";
import type { Product } from "../../lib/catalog";
import ProductCard from "./ProductCard";

type ProductGridProps = {
    products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <p className="text-foreground">
                    এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই।
                </p>

                <Link
                    href="/products"
                    className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                    সব পণ্য দেখুন
                </Link>
            </div>
        );
    }

    return (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
            {products.map((product) => (
                <li key={product.id}>
                    <ProductCard product={product} />
                </li>
            ))}
        </ul>
    );
}