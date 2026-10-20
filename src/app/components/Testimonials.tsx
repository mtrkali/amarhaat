import { Star } from "lucide-react";
import { getTestimonials } from "../../lib/catalog";
import SectionHeader from "./SectionHeader";

export default async function Testimonials() {
    const testimonials = await getTestimonials().catch(() => []);

    // No real customer opinions yet: leave the section out instead of showing fake ones.
    if (testimonials.length === 0) return null;

    return (
        <section aria-labelledby="testimonials-heading">
            <SectionHeader
                id="testimonials-heading"
                title="আমাদের গ্রাহকদের মতামত"
            />

            {/* Mobile: swipe sideways. md and up: a normal grid. */}
            <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
                {testimonials.map((item) => (
                    <li
                        key={item.id}
                        className="w-[85%] shrink-0 snap-start md:w-auto"
                    >
                        <figure className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4">
                            <figcaption className="flex items-center gap-3">
                                <span
                                    aria-hidden="true"
                                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-green text-lg font-bold text-primary"
                                >
                                    {Array.from(item.name)[0]}
                                </span>

                                <span className="text-sm leading-snug">
                                    <span className="block font-semibold text-foreground">
                                        {item.name}
                                    </span>
                                    <span className="block text-muted-foreground">
                                        {item.area}
                                    </span>
                                </span>
                            </figcaption>

                            <div
                                role="img"
                                aria-label={`৫ এর মধ্যে ${item.rating} রেটিং`}
                                className="flex gap-0.5"
                            >
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                        key={index}
                                        aria-hidden="true"
                                        className={`size-4 ${index < item.rating
                                            ? "fill-amber-500 text-amber-500"
                                            : "text-border"
                                            }`}
                                    />
                                ))}
                            </div>

                            <blockquote className="text-sm leading-relaxed text-foreground">
                                “{item.quote}”
                            </blockquote>
                        </figure>
                    </li>
                ))}
            </ul>
        </section>
    );
}