import type { Metadata } from "next";
import CheckoutForm from "../components/CheckoutForm";
import PageHeading from "../components/PageHeading";

export const metadata: Metadata = {
    title: "চেকআউট | Amar Haat",
    description: "ডেলিভারির তথ্য দিয়ে আপনার অর্ডার নিশ্চিত করুন।",
    // A personal checkout page should not show up in search results.
    robots: { index: false, follow: false },
};

export default function CheckoutPage() {
    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={[
                    { label: "হোম", href: "/" },
                    { label: "কার্ট", href: "/cart" },
                    { label: "চেকআউট" },
                ]}
                title="চেকআউট"
            />

            <CheckoutForm />
        </main>
    );
}