// Temporary mock data for the homepage.
// TODO: replace with real API calls once products and categories exist in the backend.
// To use a real image, set the `image` field (a path under /public).

export type Category = {
    id: string;
    name: string;
    emoji: string;
    image?: string;
    href: string;
};

export type Product = {
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    rating: number;
    reviewCount: number;
    emoji: string;
    image?: string;
    href: string;
};

export const categories: Category[] = [
    { id: "vegetables-fruits", name: "সবজি ও ফল", emoji: "🥬", href: "/categories/vegetables-fruits" },
    { id: "food", name: "খাদ্য পণ্য", emoji: "🌾", href: "/categories/food" },
    { id: "clothing", name: "পোশাক", emoji: "👕", href: "/categories/clothing" },
    { id: "electronics", name: "ইলেকট্রনিক্স", emoji: "📱", href: "/categories/electronics" },
    { id: "household", name: "গৃহস্থালি পণ্য", emoji: "🧴", href: "/categories/household" },
    { id: "beauty", name: "বিউটি ও কেয়ার", emoji: "💄", href: "/categories/beauty" },
    { id: "agriculture", name: "কৃষি পণ্য", emoji: "🌱", href: "/categories/agriculture" },
];

export const products: Product[] = [
    {
        id: "tomato",
        name: "টমেটো (দেশি)",
        price: 80,
        oldPrice: 91,
        rating: 4.8,
        reviewCount: 120,
        emoji: "🍅",
        href: "/products/tomato",
    },
    {
        id: "basmati-rice",
        name: "বাসমতি চাল (৫ কেজি)",
        price: 350,
        rating: 4.6,
        reviewCount: 98,
        emoji: "🌾",
        href: "/products/basmati-rice",
    },
    {
        id: "cotton-shirt",
        name: "কটন শার্ট (মেন)",
        price: 550,
        rating: 4.7,
        reviewCount: 76,
        emoji: "👕",
        href: "/products/cotton-shirt",
    },
    {
        id: "mustard-oil",
        name: "সরিষার তেল (১ লিটার)",
        price: 210,
        rating: 4.5,
        reviewCount: 64,
        emoji: "🫒",
        href: "/products/mustard-oil",
    },
    {
        id: "eggs",
        name: "দেশি ডিম (১২ পিস)",
        price: 160,
        rating: 4.7,
        reviewCount: 88,
        emoji: "🥚",
        href: "/products/eggs",
    },
];