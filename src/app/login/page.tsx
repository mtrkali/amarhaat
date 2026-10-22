import type { Metadata } from "next";
import { safeRedirectPath } from "../../lib/auth";
import LoginForm from "../components/LoginForm";
import PageHeading from "../components/PageHeading";

type LoginPageProps = {
    searchParams: Promise<{ next?: string | string[] }>;
};

export const metadata: Metadata = {
    title: "লগইন | Amar Haat",
    robots: { index: false },
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const { next } = await searchParams;

    return (
        <main className="mx-auto w-full max-w-md flex-1 px-4 pb-10 pt-6 sm:px-6">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "লগইন" }]}
                title="লগইন"
                description="আপনার অ্যাকাউন্টে ঢুকে অর্ডার ও প্রোফাইল দেখুন।"
            />

            <LoginForm next={safeRedirectPath(next)} />
        </main>
    );
}