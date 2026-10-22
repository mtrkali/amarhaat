import type { Metadata } from "next";
import { safeRedirectPath } from "../../lib/auth";
import PageHeading from "../components/PageHeading";
import SignupForm from "../components/SignupForm";

type SignupPageProps = {
    searchParams: Promise<{ next?: string | string[] }>;
};

export const metadata: Metadata = {
    title: "সাইন আপ | Amar Haat",
    robots: { index: false },
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
    const { next } = await searchParams;

    return (
        <main className="mx-auto w-full max-w-md flex-1 px-4 pb-10 pt-6 sm:px-6">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "সাইন আপ" }]}
                title="সাইন আপ"
                description="নতুন অ্যাকাউন্ট খুলুন। এতে আপনার অর্ডারগুলো এক জায়গায় দেখতে পারবেন।"
            />

            <SignupForm next={safeRedirectPath(next)} />
        </main>
    );
}