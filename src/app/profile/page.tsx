import type { Metadata } from "next";
import PageHeading from "../components/PageHeading";
import ProfileView from "../components/ProfileView";

export const metadata: Metadata = {
    title: "আমার প্রোফাইল | Amar Haat",
    // Personal details should not show up in search results.
    robots: { index: false, follow: false },
};

export default function ProfilePage() {
    return (
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10 pt-6 sm:px-6">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "আমার প্রোফাইল" }]}
                title="আমার প্রোফাইল"
            />

            <ProfileView />
        </main>
    );
}