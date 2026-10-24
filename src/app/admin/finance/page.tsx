import type { Metadata } from "next";
import PageHeading from "../../components/PageHeading";
import AdminFinanceView from "../../components/AdminFinanceView";
export const metadata: Metadata = { title: "Finance | Amar Haat", robots: { index: false, follow: false } };
export default function AdminFinancePage() { return <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8"><PageHeading crumbs={[{ label: "হোম", href: "/" }, { label: "Admin", href: "/admin" }, { label: "Finance" }]} title="আর্থিক সারসংক্ষেপ" /><AdminFinanceView /></main>; }
