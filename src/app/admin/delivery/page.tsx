import type { Metadata } from "next";
import PageHeading from "../../components/PageHeading";
import AdminDeliveryView from "../../components/AdminDeliveryView";
export const metadata: Metadata = { title: "Delivery Admin | Amar Haat", robots: { index: false, follow: false } };
export default function DeliveryAdminPage() { return <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8"><PageHeading crumbs={[{ label: "হোম", href: "/" }, { label: "Admin", href: "/admin" }, { label: "Delivery" }]} title="ডেলিভারি পরিচালনা" /><AdminDeliveryView /></main>; }
