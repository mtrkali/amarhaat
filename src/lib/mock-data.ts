// Temporary mock data for the storefront.
// TODO: replace with real API calls once the backend has these resources.
// Images live in /public/images. To use a real photo, replace the file with the same name.
// Products without an `image` show their emoji until a photo is added.

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
    categoryId: string;
    price: number;
    oldPrice?: number;
    rating: number;
    reviewCount: number;
    emoji: string;
    image?: string;
    href: string;
};

export type Seller = {
    id: string;
    name: string;
    category: string;
    emoji: string;
    image?: string;
    href: string;
};

export type Testimonial = {
    id: string;
    name: string;
    area: string;
    rating: number;
    quote: string;
};

export type Faq = {
    id: string;
    question: string;
    answer: string;
};

export const categories: Category[] = [
    { id: "vegetables-fruits", name: "সবজি ও ফল", emoji: "🥬", image: "/images/categories/vegetables-fruits.webp", href: "/categories/vegetables-fruits" },
    { id: "food", name: "খাদ্য পণ্য", emoji: "🌾", image: "/images/categories/food.webp", href: "/categories/food" },
    { id: "clothing", name: "পোশাক", emoji: "👕", image: "/images/categories/clothing.webp", href: "/categories/clothing" },
    { id: "electronics", name: "ইলেকট্রনিক্স", emoji: "📱", image: "/images/categories/electronics.webp", href: "/categories/electronics" },
    { id: "household", name: "গৃহস্থালি পণ্য", emoji: "🧴", image: "/images/categories/household.webp", href: "/categories/household" },
    { id: "beauty", name: "বিউটি ও কেয়ার", emoji: "💄", image: "/images/categories/beauty.webp", href: "/categories/beauty" },
    { id: "agriculture", name: "কৃষি পণ্য", emoji: "🌱", image: "/images/categories/agriculture.webp", href: "/categories/agriculture" },
];

// Sample products (names, prices and ratings are made up for the design).
export const products: Product[] = [
    {
        id: "tomato",
        name: "টমেটো (দেশি)",
        categoryId: "vegetables-fruits",
        price: 80,
        oldPrice: 91,
        rating: 4.8,
        reviewCount: 120,
        emoji: "🍅",
        image: "/images/products/tomato.webp",
        href: "/products/tomato",
    },
    {
        id: "basmati-rice",
        name: "বাসমতি চাল (৫ কেজি)",
        categoryId: "food",
        price: 350,
        rating: 4.6,
        reviewCount: 98,
        emoji: "🌾",
        image: "/images/products/basmati-rice.webp",
        href: "/products/basmati-rice",
    },
    {
        id: "cotton-shirt",
        name: "কটন শার্ট (মেন)",
        categoryId: "clothing",
        price: 550,
        rating: 4.7,
        reviewCount: 76,
        emoji: "👕",
        image: "/images/products/cotton-shirt.webp",
        href: "/products/cotton-shirt",
    },
    {
        id: "mustard-oil",
        name: "সরিষার তেল (১ লিটার)",
        categoryId: "food",
        price: 210,
        rating: 4.5,
        reviewCount: 64,
        emoji: "🫒",
        image: "/images/products/mustard-oil.webp",
        href: "/products/mustard-oil",
    },
    {
        id: "eggs",
        name: "দেশি ডিম (১২ পিস)",
        categoryId: "food",
        price: 160,
        rating: 4.7,
        reviewCount: 88,
        emoji: "🥚",
        image: "/images/products/eggs.webp",
        href: "/products/eggs",
    },
    {
        id: "potato",
        name: "আলু (দেশি, ১ কেজি)",
        categoryId: "vegetables-fruits",
        price: 45,
        rating: 4.4,
        reviewCount: 52,
        emoji: "🥔",
        href: "/products/potato",
    },
    {
        id: "banana",
        name: "সাগর কলা (১ ডজন)",
        categoryId: "vegetables-fruits",
        price: 90,
        oldPrice: 100,
        rating: 4.6,
        reviewCount: 41,
        emoji: "🍌",
        href: "/products/banana",
    },
    {
        id: "lentils",
        name: "মসুর ডাল (১ কেজি)",
        categoryId: "food",
        price: 140,
        rating: 4.5,
        reviewCount: 73,
        emoji: "🫘",
        href: "/products/lentils",
    },
    {
        id: "panjabi",
        name: "কটন পাঞ্জাবি",
        categoryId: "clothing",
        price: 950,
        oldPrice: 1100,
        rating: 4.6,
        reviewCount: 39,
        emoji: "👘",
        href: "/products/panjabi",
    },
    {
        id: "earbuds",
        name: "ওয়্যারলেস ইয়ারবাড",
        categoryId: "electronics",
        price: 990,
        rating: 4.2,
        reviewCount: 57,
        emoji: "🎧",
        href: "/products/earbuds",
    },
    {
        id: "power-bank",
        name: "পাওয়ার ব্যাংক (১০০০০ mAh)",
        categoryId: "electronics",
        price: 1250,
        rating: 4.4,
        reviewCount: 48,
        emoji: "🔋",
        href: "/products/power-bank",
    },
    {
        id: "detergent",
        name: "ডিটারজেন্ট পাউডার (১ কেজি)",
        categoryId: "household",
        price: 120,
        rating: 4.3,
        reviewCount: 66,
        emoji: "🧴",
        href: "/products/detergent",
    },
    {
        id: "face-cream",
        name: "ফেস ক্রিম (৫০ গ্রাম)",
        categoryId: "beauty",
        price: 180,
        oldPrice: 200,
        rating: 4.5,
        reviewCount: 34,
        emoji: "💄",
        href: "/products/face-cream",
    },
    {
        id: "vegetable-seeds",
        name: "সবজির বীজ (প্যাকেট)",
        categoryId: "agriculture",
        price: 30,
        rating: 4.7,
        reviewCount: 29,
        emoji: "🌱",
        href: "/products/vegetable-seeds",
    },
    {
        id: "organic-fertilizer",
        name: "জৈব সার (৫ কেজি)",
        categoryId: "agriculture",
        price: 250,
        rating: 4.6,
        reviewCount: 31,
        emoji: "🌿",
        href: "/products/organic-fertilizer",
    },
];

// The homepage "popular products" row shows the first five.
export const popularProducts: Product[] = products.slice(0, 5);

export function getCategory(id: string): Category | undefined {
    return categories.find((category) => category.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
    return products.filter((product) => product.categoryId === categoryId);
}

export const sellers: Seller[] = [
    { id: "aliza-farm", name: "আলিজা ফার্ম", category: "কৃষি পণ্য", emoji: "🧑‍🌾", image: "/images/sellers/aliza-farm.webp", href: "/sellers/aliza-farm" },
    { id: "suhana-boutique", name: "সুহানা বুটিক", category: "পোশাক", emoji: "👗", image: "/images/sellers/suhana-boutique.webp", href: "/sellers/suhana-boutique" },
    { id: "rahim-store", name: "রহিম স্টোর", category: "গৃহস্থালি পণ্য", emoji: "🏪", image: "/images/sellers/rahim-store.webp", href: "/sellers/rahim-store" },
    { id: "mehedi-food", name: "মেহেদী ফুড", category: "খাদ্য পণ্য", emoji: "🍱", image: "/images/sellers/mehedi-food.webp", href: "/sellers/mehedi-food" },
];

// Sample reviews for the design. Replace with real customer reviews before launch.
export const testimonials: Testimonial[] = [
    {
        id: "rahima",
        name: "রহিমা আক্তার",
        area: "ফেনী",
        rating: 5,
        quote: "Amar Haat থেকে প্রথমবার অর্ডার করলাম, পণ্য অনেক ভালো ছিল। ডেলিভারিও দ্রুত পেয়েছি।",
    },
    {
        id: "sample-2",
        name: "নমুনা গ্রাহক ২",
        area: "ফেনী",
        rating: 5,
        quote: "এখানে নমুনা মতামত থাকবে। আসল গ্রাহকের মতামত পেলে বদলে দিন।",
    },
    {
        id: "sample-3",
        name: "নমুনা গ্রাহক ৩",
        area: "ফেনী",
        rating: 4,
        quote: "এখানে নমুনা মতামত থাকবে। আসল গ্রাহকের মতামত পেলে বদলে দিন।",
    },
];

// TODO: the owner of Amar Haat should confirm these answers match the real policies.
export const faqs: Faq[] = [
    {
        id: "how-to-order",
        question: "কিভাবে অর্ডার করবো?",
        answer: "পছন্দের পণ্য কার্টে যোগ করুন, ডেলিভারির ঠিকানা দিন এবং অর্ডার নিশ্চিত করুন। লগইন ছাড়াও অতিথি হিসেবে অর্ডার করা যাবে।",
    },
    {
        id: "delivery-time",
        question: "ডেলিভারি কতদিনে হবে?",
        answer: "ফেনী এরিয়ায় দ্রুত ডেলিভারি দেওয়া হয়। পণ্য ও এলাকা অনুযায়ী সময় আলাদা হতে পারে।",
    },
    {
        id: "payment",
        question: "পেমেন্ট পদ্ধতি কি কি?",
        answer: "ক্যাশ অন ডেলিভারি (COD) সুবিধা আছে, অর্থাৎ পণ্য হাতে পেয়ে টাকা দিতে পারবেন।",
    },
    {
        id: "return",
        question: "রিটার্ন বা এক্সচেঞ্জ করা যাবে?",
        answer: "রিটার্ন ও এক্সচেঞ্জের নিয়ম পণ্যভেদে আলাদা। বিস্তারিত জানতে রিটার্ন নীতি দেখুন।",
    },
];