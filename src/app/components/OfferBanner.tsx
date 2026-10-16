import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type OfferBannerProps = {
    // Path under /public, e.g. "/images/offer.webp".
    image?: string;
};

export default function OfferBanner({ image }: OfferBannerProps) {
    return (
        <section aria-labelledby="offer-heading">
            <div className="relative overflow-hidden rounded-2xl bg-banner p-6 text-banner-foreground md:p-10">
                <div className="relative z-10 max-w-[60%] md:max-w-md">
                    <h2
                        id="offer-heading"
                        className="text-2xl font-bold leading-snug md:text-3xl"
                    >
                        ফেনীর বিশেষ অফার
                    </h2>

                    <p className="mt-2 text-sm text-banner-foreground/85 md:text-base">
                        স্থানীয় পণ্য থাকছে বিশেষ ছাড়!
                    </p>

                    {/* TODO: /offers page does not exist yet. */}
                    <Link
                        href="/offers"
                        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-green-900 transition-colors hover:bg-green-50"
                    >
                        এখনই দেখুন
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
                        🌾🍚
                    </div>
                )}
            </div>
        </section>
    );
}