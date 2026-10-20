// Temporary sample sellers for the home page.
// TODO: the backend has no public list of shops yet. When it does (for example a
// GET /sellers/public route), replace this file with a real API call.

export type Seller = {
    id: string;
    name: string;
    category: string;
    emoji: string;
    image?: string;
    href: string;
};

export const sellers: Seller[] = [
    { id: "aliza-farm", name: "আলিজা ফার্ম", category: "কৃষি পণ্য", emoji: "🧑‍🌾", image: "/images/sellers/aliza-farm.webp", href: "/sellers/aliza-farm" },
    { id: "suhana-boutique", name: "সুহানা বুটিক", category: "পোশাক", emoji: "👗", image: "/images/sellers/suhana-boutique.webp", href: "/sellers/suhana-boutique" },
    { id: "rahim-store", name: "রহিম স্টোর", category: "গৃহস্থালি পণ্য", emoji: "🏪", image: "/images/sellers/rahim-store.webp", href: "/sellers/rahim-store" },
    { id: "mehedi-food", name: "মেহেদী ফুড", category: "খাদ্য পণ্য", emoji: "🍱", image: "/images/sellers/mehedi-food.webp", href: "/sellers/mehedi-food" },
];