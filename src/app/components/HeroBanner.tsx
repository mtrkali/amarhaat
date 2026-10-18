import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type HeroBannerProps = {
    // Path under /public, e.g. "/images/hero.webp". Without it a plain panel is shown.
    image?: string;
};

export default function HeroBanner({ image }: HeroBannerProps) {
    return (
        <section
            aria-labelledby="hero-heading"
            className="relative isolate overflow-hidden bg-surface-green md:mx-6 md:mt-6 md:rounded-3xl lg:mx-8"
        >
            {image && (
                <>
                    <Image
                        src={image}
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className="-z-20 object-cover object-right"
                    />
                    {/* Fades the photo into the theme colour so the text stays readable in light and dark. */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 bg-gradient-to-r from-surface-green via-surface-green/45 to-transparent"
                    />
                </>
            )}

            {/* Placeholder decoration, shown only until a real image is set. */}
            {!image && (
                <div
                    aria-hidden="true"
                    className="absolute bottom-8 right-8 hidden select-none text-8xl sm:block lg:text-9xl"
                >
                    🧺
                </div>
            )}

            <div className="px-4 pb-16 pt-8 sm:px-6 md:pb-20 md:pt-12 lg:px-10 lg:pb-24 lg:pt-16">
                <h1
                    id="hero-heading"
                    className="max-w-md text-3xl font-bold leading-snug text-foreground md:max-w-lg md:text-4xl lg:text-5xl lg:leading-tight"
                >
                    ফেনীর স্থানীয় পণ্য, এখন আপনার হাতের নাগালে
                </h1>

                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                    স্থানীয় দোকান ও কৃষকের পণ্য এখন অনলাইনে। সাশ্রয়ী দামে, নিরাপদে, ঘরে বসে কিনুন।
                </p>

                {/* TODO: /products page does not exist yet. */}
                <Link
                    href="/products"
                    className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                    এখনই কিনুন
                    <ArrowRight className="size-5" />
                </Link>
            </div>
        </section>
    );
}