import type { Metadata } from "next";
import OrderSuccess from "../components/OrderSuccess";
import PageHeading from "../components/PageHeading";

export const metadata: Metadata = {
    title: "অর্ডার সম্পন্ন | Amar Haat",
    description: "আপনার অর্ডার গ্রহণ করা হয়েছে।",
    // A personal order page should not show up in search results.
    robots: { index: false, follow: false },
};

export default function OrderSuccessPage() {
    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "অর্ডার সম্পন্ন" }]}
                title="অর্ডার সম্পন্ন"
            />

            <OrderSuccess />
        </main>
    );
}
