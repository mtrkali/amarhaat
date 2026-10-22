import { ChevronDown } from "lucide-react";
import type { Faq } from "../../lib/catalog";

type FaqListProps = {
    faqs: Faq[];
};

// Used on the home page (FaqSection) and on the /help page.
// Native <details> gives keyboard and screen-reader support with no JavaScript.
export default function FaqList({ faqs }: FaqListProps) {
    return (
        <div className="space-y-2">
            {faqs.map((faq) => (
                <details
                    key={faq.id}
                    className="group rounded-xl border border-border bg-card"
                >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-sm font-medium text-foreground md:text-base [&::-webkit-details-marker]:hidden">
                        {faq.question}
                        <ChevronDown
                            aria-hidden="true"
                            className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        />
                    </summary>

                    <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                    </p>
                </details>
            ))}
        </div>
    );
}