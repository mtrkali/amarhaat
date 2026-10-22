import { getFaqs } from "../../lib/catalog";
import FaqList from "./FaqList";
import SectionHeader from "./SectionHeader";

export default async function FaqSection() {
    const faqs = await getFaqs().catch(() => []);

    if (faqs.length === 0) return null;

    return (
        <section aria-labelledby="faq-heading">
            <SectionHeader
                id="faq-heading"
                title="সাধারণ জিজ্ঞাসা"
                href="/help"
            />

            <FaqList faqs={faqs} />
        </section>
    );
}