"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Category } from "../../lib/catalog";

const SLIDE_MS = 5000;
const FALLBACK_IMAGE = "/images/hero.webp";

const HERO_IMAGE: Record<string, string> = {
    "vegetables-fruits": "/images/hero/vegetables-fruits.webp",
    food: "/images/hero/food.webp",
    clothing: "/images/hero/clothing.webp",
    electronics: "/images/hero/electronics.webp",
    household: "/images/hero/household.webp",
    beauty: "/images/hero/beauty.webp",
    agriculture: "/images/hero/agriculture.webp",
};

type HeroSlideshowProps = {
    categories: Category[];
};

export default function HeroSlideshow({ categories }: HeroSlideshowProps) {
    const slides = categories.slice(0, 7);
    const [index, setIndex] = useState(0);
    const [failed, setFailed] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (slides.length <= 1) return;

        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (media.matches) return;

        const timer = window.setTimeout(() => {
            setIndex((current) => (current + 1) % slides.length);
        }, SLIDE_MS);

        return () => window.clearTimeout(timer);
    }, [index, slides.length]);

    if (slides.length === 0) return null;

    const active = slides[index] ?? slides[0];

    return (
        <section
            aria-labelledby="hero-heading"
            className="relative isolate overflow-hidden bg-surface-green md:mx-6 md:mt-6 md:rounded-3xl lg:mx-8"
        >
            <div className="hero-slides" aria-hidden="true">
                {slides.map((category, slideIndex) => {
                    const src = failed[category.id]
                        ? FALLBACK_IMAGE
                        : (HERO_IMAGE[category.id] ?? FALLBACK_IMAGE);

                    return (
                        <div
                            key={category.id}
                            className={`hero-slide${slideIndex === index ? " is-active" : ""}`}
                        >
                            <Image
                                src={src}
                                alt=""
                                fill
                                priority={slideIndex === 0}
                                sizes="100vw"
                                className="hero-slide-img"
                                onError={() =>
                                    setFailed((current) =>
                                        current[category.id]
                                            ? current
                                            : { ...current, [category.id]: true },
                                    )
                                }
                            />
                        </div>
                    );
                })}
            </div>

            <div
                aria-hidden="true"
                className="absolute inset-0 z-[1] bg-gradient-to-r from-surface-green via-surface-green/30 to-surface-green/0"
            />

            <div className="relative z-[2] px-4 pb-16 pt-8 sm:px-6 md:pb-20 md:pt-14 lg:px-10 lg:pb-24 lg:pt-16">
                <h1
                    id="hero-heading"
                    className="max-w-xl text-3xl font-bold leading-snug text-foreground md:max-w-2xl md:text-4xl lg:text-5xl lg:leading-tight"
                >
                    ফেনীর স্থানীয়{" "}
                    <span className="hero-category-word" key={active.id}>
                        {active.name}
                    </span>
                    {", এখন আপনার হাতের নাগালে"}
                </h1>

                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                    স্থানীয় দোকান ও কৃষকের পণ্য এখন অনলাইনে। সাশ্রয়ী দামে, নিরাপদে, ঘরে বসে কিনুন।
                </p>

                <p className="sr-only" aria-live="polite">
                    এখন দেখাচ্ছে: {active.name}
                </p>

                <Link
                    href={active.href}
                    className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                    এখনই কিনুন
                    <ArrowRight className="size-5" />
                </Link>

                <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="ক্যাটাগরি">
                    {slides.map((category, slideIndex) => (
                        <button
                            key={category.id}
                            type="button"
                            role="tab"
                            aria-selected={slideIndex === index}
                            aria-label={category.name}
                            className={`hero-slide-dot${slideIndex === index ? " is-active" : ""}`}
                            onClick={() => setIndex(slideIndex)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
