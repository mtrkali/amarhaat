import { BadgeCheck, ShieldCheck, Store, Truck } from "lucide-react";

const reasons = [
    { Icon: Store, title: "স্থানীয় ব্যবসায়ী", note: "সাপোর্ট করি" },
    { Icon: ShieldCheck, title: "নিরাপদ লেনদেন", note: "(COD)" },
    { Icon: Truck, title: "দ্রুত ডেলিভারি", note: "(ফেনী এরিয়া)" },
    { Icon: BadgeCheck, title: "বিশ্বাসযোগ্য", note: "পণ্য ও সেবা" },
];

export default function WhyAmarHaat() {
    return (
        <section
            aria-labelledby="why-heading"
            className="rounded-2xl border border-border bg-card p-4 md:p-6"
        >
            <h2
                id="why-heading"
                className="mb-4 text-lg font-bold text-foreground md:text-xl"
            >
                কেন Amar Haat?
            </h2>

            <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {reasons.map(({ Icon, title, note }) => (
                    <li key={title} className="flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-green text-primary">
                            <Icon className="size-6" strokeWidth={1.8} />
                        </span>

                        <span className="text-sm leading-snug">
                            <span className="block font-semibold text-foreground">
                                {title}
                            </span>
                            <span className="block text-muted-foreground">
                                {note}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}