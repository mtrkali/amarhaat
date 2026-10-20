import type { Metadata } from "next";
import OrderTracker from "../components/OrderTracker";
import PageHeading from "../components/PageHeading";

export const metadata: Metadata = {
    title: "অর্ডারের অবস্থা | Amar Haat",
    description: "অর্ডার নম্বর ও মোবাইল নম্বর দিয়ে আপনার অর্ডারের অবস্থা দেখুন।",
    // Personal order details should not show up in search results.
    robots: { index: false, follow: false },
};

export default function OrdersPage() {
    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "আমার অর্ডার" }]}
                title="আমার অর্ডার"
                description="অর্ডার নম্বর ও অর্ডারে দেওয়া মোবাইল নম্বর লিখে অবস্থা দেখুন।"
            />

            <OrderTracker />
        </main>
    );
}