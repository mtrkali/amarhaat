import type { Metadata } from "next";
import CartContents from "../components/CartContents";
import PageHeading from "../components/PageHeading";

export const metadata: Metadata = {
    title: "আমার কার্ট | Amar Haat",
    description: "আপনার কার্টে রাখা পণ্যগুলো দেখুন ও অর্ডারের জন্য প্রস্তুত হোন।",
};

export default function CartPage() {
    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "কার্ট" }]}
                title="আমার কার্ট"
            />

            <CartContents />
        </main>
    );
}