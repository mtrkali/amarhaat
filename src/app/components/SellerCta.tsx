import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SellerCtaProps = {
    // Path under /public, e.g. "/images/shop.webp".
    image?: string;
};

export default function SellerCta({ image }: SellerCtaProps) {
    return (
        <section aria-labelledby="seller-cta-heading">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-green p-6 md:p-10">
                <div className="relative z-10 max-w-[65%] md:max-w-md">
                    <h2
                        id="seller-cta-heading"
                        className="text-xl font-bold leading-snug text-foreground md:text-3xl"
                    >
                        আপনি কি বিক্রি করতে চান?
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground md:text-base">
                        Amar Haat-এ আপনার দোকান/পণ্য তুলে ধরুন হাজারো ক্রেতার কাছে।
                    </p>

                    {/* TODO: /sell does not exist yet. */}
                    <Link
                        href="/sell"
                        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                        সেলার হিসেবে যোগ দিন
                        <ArrowRight className="size-4" />
                    </Link>
                </div>

                {image ? (
                    <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain object-right"
                    />
                ) : (
                    // Placeholder decoration, shown only until a real image is set.
                    <div
                        aria-hidden="true"
                        className="absolute bottom-3 right-4 select-none text-6xl md:text-8xl"
                    >
                        🏪
                    </div>
                )}
            </div>
        </section>
    );
}