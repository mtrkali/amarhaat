import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type JoinUsBannerProps = {
    // Path under /public, e.g. "/images/feni-bridge.webp".
    image?: string;
};

export default function JoinUsBanner({ image }: JoinUsBannerProps) {
    return (
        <section aria-labelledby="join-heading">
            <div className="relative isolate overflow-hidden rounded-2xl bg-banner p-6 text-banner-foreground md:p-10">
                {image && (
                    <>
                        <Image
                            src={image}
                            alt=""
                            fill
                            sizes="(max-width: 1280px) 100vw, 1280px"
                            className="-z-20 object-cover"
                        />
                        {/* Dark overlay keeps the white text readable on any photo. */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/40 to-transparent"
                        />
                    </>
                )}

                <div className="max-w-md">
                    <h2
                        id="join-heading"
                        className="text-2xl font-bold leading-snug md:text-3xl"
                    >
                        আমাদের সাথে থাকুন, স্থানীয় পণ্যের পাশে
                    </h2>

                    <p className="mt-2 text-sm text-banner-foreground/85 md:text-base">
                        ফেনীর উন্নয়নে, স্থানীয় ব্যবসায়ীদের পাশে
                    </p>

                    {/* TODO: /signup does not exist yet. */}
                    <Link
                        href="/signup"
                        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-green-900 transition-colors hover:bg-green-50"
                    >
                        এখনই যুক্ত হোন
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}