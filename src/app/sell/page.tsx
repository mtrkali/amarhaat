import type { Metadata } from "next";
import PageHeading from "../components/PageHeading";
import SellerApply from "../components/SellerApply";

export const metadata: Metadata = {
    title: "বিক্রেতা হিসেবে যোগ দিন | Amar Haat",
    description: "Amar Haat-এ আপনার দোকান খোলার জন্য আবেদন করুন।",
};

const steps = [
    "লগইন করুন, অ্যাকাউন্ট না থাকলে সাইন আপ করুন।",
    "আপনার দোকানের নাম দিয়ে আবেদন পাঠান।",
    "অ্যাডমিন আবেদনটি পর্যালোচনা করেন। আবেদনের অবস্থা এই পেজে ও প্রোফাইলে দেখা যায়।",
];

export default function SellPage() {
    return (
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10 pt-6 sm:px-6">
            <PageHeading
                crumbs={[
                    { label: "হোম", href: "/" },
                    { label: "বিক্রেতা হিসেবে যোগ দিন" },
                ]}
                title="বিক্রেতা হিসেবে যোগ দিন"
                description="আপনার দোকান বা পণ্য ফেনীর ক্রেতাদের কাছে তুলে ধরুন।"
            />

            <section aria-labelledby="sell-steps-heading" className="mb-6">
                <h2 id="sell-steps-heading" className="mb-3 text-lg font-bold text-foreground">
                    কীভাবে কাজ করে
                </h2>

                <ol className="space-y-2">
                    {steps.map((step, index) => (
                        <li
                            key={step}
                            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm text-foreground"
                        >
                            <span
                                aria-hidden="true"
                                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                            >
                                {(index + 1).toLocaleString("bn-BD")}
                            </span>
                            <span className="pt-0.5">{step}</span>
                        </li>
                    ))}
                </ol>
            </section>

            <SellerApply />
        </main>
    );
}