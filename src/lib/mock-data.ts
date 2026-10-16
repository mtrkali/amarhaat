// Temporary mock data for the homepage.
// TODO: replace with real API calls once the backend has these resources.
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

export const sellers: Seller[] = [
    { id: "aliza-farm", name: "আলিজা ফার্ম", category: "কৃষি পণ্য", emoji: "🧑‍🌾", href: "/sellers/aliza-farm" },
    { id: "suhana-boutique", name: "সুহানা বুটিক", category: "পোশাক", emoji: "👗", href: "/sellers/suhana-boutique" },
    { id: "rahim-store", name: "রহিম স্টোর", category: "গৃহস্থালি পণ্য", emoji: "🏪", href: "/sellers/rahim-store" },
    { id: "mehedi-food", name: "মেহেদী ফুড", category: "খাদ্য পণ্য", emoji: "🍱", href: "/sellers/mehedi-food" },
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