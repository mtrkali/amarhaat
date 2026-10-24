import type { Metadata } from "next";
import PageHeading from "../../components/PageHeading";
import RiderDashboardView from "../../components/RiderDashboardView";
export const metadata: Metadata = { title: "Rider Dashboard | Amar Haat", robots: { index: false, follow: false } };
export default function RiderDashboardPage() { return <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8"><PageHeading crumbs={[{ label: "হোম", href: "/" }, { label: "Rider dashboard" }]} title="Rider ড্যাশবোর্ড" /><RiderDashboardView /></main>; }
