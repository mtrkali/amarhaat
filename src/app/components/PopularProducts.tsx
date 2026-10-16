import { products } from "../../lib/mock-data";
import ProductCard from "./ProductCard";
import SectionHeader from "./SectionHeader";

export default function PopularProducts() {
    return (
        <section aria-labelledby="products-heading">
            <SectionHeader
                id="products-heading"
                title="জনপ্রিয় পণ্য"
                href="/products"
            />

            {/* Mobile: horizontal scroll. md and up: a normal grid. */}
            <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
                {products.map((product) => (
                    <li
                        key={product.id}
                        className="w-40 shrink-0 snap-start md:w-auto"
                    >
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </section>
    );
}