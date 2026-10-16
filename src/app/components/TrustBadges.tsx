import { ShieldCheck, Truck, UserCheck } from "lucide-react";

const badges = [
    { Icon: Truck, title: "দ্রুত ডেলিভারি", note: "(ফেনী এরিয়া)" },
    { Icon: ShieldCheck, title: "নিরাপদ পেমেন্ট", note: "(COD)" },
    { Icon: UserCheck, title: "স্থানীয় সেলার", note: "আপনার এলাকার" },
];

export default function TrustBadges() {
    return (
        // Pulled up with a negative margin so it overlaps the bottom of the hero.
        <section
            aria-label="Amar Haat-এর সুবিধা"
            className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8"
        >
            <ul className="mx-auto grid max-w-3xl grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-3 shadow-md sm:gap-4 sm:p-4">
                {badges.map(({ Icon, title, note }) => (
                    <li
                        key={title}
                        className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
                    >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-green text-primary">
                            <Icon className="size-6" strokeWidth={1.8} />
                        </span>

                        <span className="text-xs leading-snug sm:text-sm">
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