import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck, UserCheck } from "lucide-react";
import {
    getCategory,
    getProductsByCategory,
    products,
} from "../../../lib/mock-data";
import AddToCart from "../../components/AddToCart";
import PageHeading from "../../components/PageHeading";
import ProductGrid from "../../components/ProductGrid";
import SectionHeader from "../../components/SectionHeader";

type ProductPageProps = {
    params: Promise<{ id: string }>;
};

const perks = [
    { Icon: Truck, text: "ফেনী এরিয়ায় দ্রুত ডেলিভারি" },
    { Icon: ShieldCheck, text: "ক্যাশ অন ডেলিভারি (COD)" },
    { Icon: UserCheck, text: "স্থানীয় সেলারের পণ্য" },
];

function findProduct(id: string) {
    return products.find((product) => product.id === id);
}

export function generateStaticParams() {
    return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
    params,
}: ProductPageProps): Promise<Metadata> {
    const { id } = await params;
    const product = findProduct(id);

    if (!product) {
        return { title: "পণ্য পাওয়া যায়নি | Amar Haat" };
    }

    return {
        title: `${product.name} | Amar Haat`,
        description: `${product.name}, ৳${product.price}। ফেনীর স্থানীয় পণ্য, ঘরে বসে অর্ডার করুন।`,
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = findProduct(id);

    if (!product) {
        notFound();
    }

    const category = getCategory(product.categoryId);

    const related = getProductsByCategory(product.categoryId)
        .filter((item) => item.id !== product.id)
        .slice(0, 4);

    const discount =
        product.oldPrice && product.oldPrice > product.price
            ? Math.round((1 - product.price / product.oldPrice) * 100)
            : 0;

    const crumbs = [
        { label: "হোম", href: "/" },
        { label: "সব পণ্য", href: "/products" },
        ...(category ? [{ label: category.name, href: category.href }] : []),
        { label: product.name },
    ];

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading crumbs={crumbs} title={product.name} />

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
                {/* Product image */}
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted md:aspect-[4/3]">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                    ) : (
                        <span
                            aria-hidden="true"
                            className="flex size-full items-center justify-center text-8xl"
                        >
                            {product.emoji}
                        </span>
                    )}

                    {discount > 0 && (
                        <span className="absolute left-3 top-3 rounded-md bg-badge px-2 py-1 text-xs font-bold text-badge-foreground">
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* Product details */}
                <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        {category && (
                            <Link
                                href={category.href}
                                className="rounded-full bg-surface-green px-3 py-1 font-medium text-primary transition-colors hover:text-primary-hover"
                            >
                                {category.name}
                            </Link>
                        )}

                        <p className="flex items-center gap-1 text-muted-foreground">
                            <Star
                                aria-hidden="true"
                                className="size-4 fill-amber-500 text-amber-500"
                            />
                            <span className="sr-only">রেটিং ৫ এর মধ্যে </span>
                            {product.rating.toFixed(1)} ({product.reviewCount}টি
                            রিভিউ)
                        </p>
                    </div>

                    <div>
                        <p className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-foreground">
                                ৳{product.price}
                            </span>

                            {product.oldPrice && (
                                <del className="text-lg text-muted-foreground">
                                    ৳{product.oldPrice}
                                </del>
                            )}
                        </p>

                        {discount > 0 && product.oldPrice && (
                            <p className="mt-1 text-sm font-medium text-success">
                                আপনি ৳{product.oldPrice - product.price} সাশ্রয়
                                করছেন ({discount}%)
                            </p>
                        )}
                    </div>

                    <AddToCart
                        productId={product.id}
                        productName={product.name}
                        unitPrice={product.price}
                    />

                    <ul className="space-y-3 rounded-2xl border border-border bg-card p-4">
                        {perks.map(({ Icon, text }) => (
                            <li
                                key={text}
                                className="flex items-center gap-3 text-sm text-foreground"
                            >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-green text-primary">
                                    <Icon
                                        aria-hidden="true"
                                        className="size-5"
                                        strokeWidth={1.8}
                                    />
                                </span>
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {
                related.length > 0 && (
                    <section aria-labelledby="related-heading" className="mt-12">
                        <SectionHeader
                            id="related-heading"
                            title="একই ক্যাটাগরির আরও পণ্য"
                            href={category?.href}
                        />

                        <ProductGrid products={related} />
                    </section>
                )
            }
        </main >
    );
}