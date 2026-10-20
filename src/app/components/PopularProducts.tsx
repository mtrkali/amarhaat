import { getProducts, pickPopular } from "../../lib/catalog";
import ProductCard from "./ProductCard";
import SectionHeader from "./SectionHeader";

export default async function PopularProducts() {
    const products = await getProducts().catch(() => []);
    const popularProducts = pickPopular(products);

    if (popularProducts.length === 0) return null;

    return (
        <section aria-labelledby="products-heading">
            <SectionHeader
                id="products-heading"
                title="জনপ্রিয় পণ্য"
                href="/products"
            />

            {/* Phones and tablets: horizontal scroll. lg and up: a 5-column grid. */}
            <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
                {popularProducts.map((product) => (
                    <li
                        key={product.id}
                        className="w-40 shrink-0 snap-start md:w-48 lg:w-auto"
                    >
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </section>
    );
}