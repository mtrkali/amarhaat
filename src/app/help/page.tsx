import type { Metadata } from "next";
import Link from "next/link";
import { getFaqs, type Faq } from "../../lib/catalog";
import FaqList from "../components/FaqList";
import LoadError from "../components/LoadError";
import PageHeading from "../components/PageHeading";

export const metadata: Metadata = {
    title: "সাহায্য ও FAQ | Amar Haat",
    description: "অর্ডার, ডেলিভারি ও পেমেন্ট নিয়ে সাধারণ প্রশ্নের উত্তর।",
};

export default async function HelpPage() {
    let faqs: Faq[] = [];
    let failed = false;

    try {
        faqs = await getFaqs();
    } catch {
        failed = true;
    }

    return (
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PageHeading
                crumbs={[{ label: "হোম", href: "/" }, { label: "সাহায্য ও FAQ" }]}
                title="সাহায্য ও FAQ"
                description="অর্ডার, ডেলিভারি ও পেমেন্ট নিয়ে সাধারণ প্রশ্নের উত্তর।"
            />

            {failed ? (
                <LoadError />
            ) : faqs.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <p className="text-foreground">
                        এখনো কোনো প্রশ্ন যোগ করা হয়নি।
                    </p>
                </div>
            ) : (
                <FaqList faqs={faqs} />
            )}

            <div className="mt-8 rounded-2xl border border-border bg-card p-5 text-center">
                <p className="font-semibold text-foreground">
                    অর্ডারের অবস্থা জানতে চান?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    অর্ডার পেজে গিয়ে আপনার অর্ডারের বর্তমান অবস্থা দেখতে পারবেন।
                </p>

                <Link
                    href="/orders"
                    className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                    আমার অর্ডার দেখুন
                </Link>
            </div>
        </main>
    );
}