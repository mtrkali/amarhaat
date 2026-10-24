import type { Metadata } from "next";
import PageHeading from "../components/PageHeading";
import AdminPanelView from "../components/AdminPanelView";

export const metadata: Metadata = {
    title: "Admin Panel | Amar Haat",
    robots: { index: false, follow: false },
};

export default function AdminPage() {
    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading crumbs={[{ label: "হোম", href: "/" }, { label: "Admin Panel" }]} title="Admin Panel" />
            <AdminPanelView />
        </main>
    );
}
