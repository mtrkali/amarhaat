import type { Metadata } from "next";
import PageHeading from "../../components/PageHeading";
import SellerDashboardView from "../../components/SellerDashboardView";

export const metadata: Metadata = {
    title: "Seller Dashboard | Amar Haat",
    robots: { index: false, follow: false },
};

export default function SellerDashboardPage() {
    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "Seller dashboard" }]}
                title="বিক্রেতা ড্যাশবোর্ড"
            />
            <SellerDashboardView />
        </main>
    );
}
