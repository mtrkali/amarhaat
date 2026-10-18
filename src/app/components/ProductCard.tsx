import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "../../lib/mock-data";
import QuickAddButton from "./QuickAddButton"


type ProductCardProps = {
    product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
    const { name, price, oldPrice, rating, reviewCount, emoji, image, href } =
        product;

    const discount =
        oldPrice && oldPrice > price
            ? Math.round((1 - price / oldPrice) * 100)
            : 0;

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
            {/* The title link below is the accessible one, so this image link is skipped by keyboard and screen readers. */}
            <Link
                href={href}
                tabIndex={-1}
                aria-hidden="true"
                className="relative block aspect-[4/3] bg-muted"
            >
                {image ? (
                    <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 160px, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover"
                    />
                ) : (
                    <span className="flex size-full items-center justify-center text-5xl">
                        {emoji}
                    </span>
                )}

                {discount > 0 && (
                    <span className="absolute right-2 top-2 rounded-md bg-badge px-1.5 py-0.5 text-[11px] font-bold text-badge-foreground">
                        -{discount}%
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col gap-2 p-3">
                <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                    <Link href={href} className="hover:text-primary">
                        {name}
                    </Link>
                </h3>

                <p className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-foreground">
                        ৳{price}
                    </span>
                    {oldPrice && (
                        <del className="text-xs text-muted-foreground">
                            ৳{oldPrice}
                        </del>
                    )}
                </p>

                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star
                        aria-hidden="true"
                        className="size-3.5 fill-amber-500 text-amber-500"
                    />
                    <span className="sr-only">রেটিং ৫ এর মধ্যে </span>
                    {rating.toFixed(1)} ({reviewCount})
                </p>

                <QuickAddButton productId={product.id} productName={name} />
            </div>
        </article>
    );
}