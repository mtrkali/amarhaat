import { getCategories, type Category } from "../../lib/catalog";
import HeroSlideshow from "./HeroSlideshow";

const FALLBACK_CATEGORIES: Category[] = [
    {
        id: "vegetables-fruits",
        name: "সবজি ও ফল",
        emoji: "🥬",
        href: "/categories/vegetables-fruits",
    },
    {
        id: "food",
        name: "খাদ্য পণ্য",
        emoji: "🌾",
        href: "/categories/food",
    },
    {
        id: "clothing",
        name: "পোশাক",
        emoji: "👕",
        href: "/categories/clothing",
    },
    {
        id: "electronics",
        name: "ইলেকট্রনিক্স",
        emoji: "📱",
        href: "/categories/electronics",
    },
    {
        id: "household",
        name: "গৃহস্থালি পণ্য",
        emoji: "🧴",
        href: "/categories/household",
    },
    {
        id: "beauty",
        name: "বিউটি ও কেয়ার",
        emoji: "💄",
        href: "/categories/beauty",
    },
    {
        id: "agriculture",
        name: "কৃষি পণ্য",
        emoji: "🌱",
        href: "/categories/agriculture",
    },
];

export default async function HeroBanner() {
    const categories = await getCategories().catch(() => FALLBACK_CATEGORIES);
    const slides =
        categories.length > 0 ? categories.slice(0, 7) : FALLBACK_CATEGORIES;

    return <HeroSlideshow categories={slides} />;
}
