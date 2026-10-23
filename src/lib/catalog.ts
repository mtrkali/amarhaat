// Reads the catalog (categories, products, FAQ, testimonials) from the backend API
// and turns it into the shapes the pages and components already use.

import { ApiError, apiFetch } from "./api";

// ---------- Shapes used by the components ----------

export type Category = {
    id: string; // the category slug, for example "vegetables-fruits"
    name: string;
    emoji: string;
    image?: string;
    href: string;
};

export type Product = {
    id: string; // the product slug, for example "tomato". The cart and orders use this.
    name: string;
    description?: string;
    categoryId: string; // the category slug
    price: number;
    oldPrice?: number;
    rating: number; // 0 when there are no reviews yet
    reviewCount: number;
    stock: number;
    sellerId: number | null;
    sellerName: string | null;
    emoji: string;
    image?: string;
    href: string;
};

export type Testimonial = {
    id: number;
    name: string;
    area: string;
    rating: number;
    quote: string;
};

export type Faq = {
    id: number;
    question: string;
    answer: string;
};

// ---------- Shapes the backend sends ----------

type ApiCategory = {
    id: number;
    slug: string;
    name: string;
    imageUrl: string | null;
};

type ApiProduct = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    categorySlug: string | null;
    price: number;
    oldPrice: number | null;
    stock: number;
    sellerId: number | null;
    sellerName: string | null;
    imageUrl: string | null;
    rating: number;
    reviewCount: number;
};

type ListResponse<T> = { success: boolean; data: T[] };
type OneResponse<T> = { success: boolean; data: T };

// ---------- Look and feel that lives only in the frontend ----------

const CATEGORY_EMOJI: Record<string, string> = {
    "vegetables-fruits": "🥬",
    food: "🌾",
    clothing: "👕",
    electronics: "📱",
    household: "🧴",
    beauty: "💄",
    agriculture: "🌱",
};

const DEFAULT_EMOJI = "🛍️";

// next/image only loads pictures from this site unless the other host is listed in
// next.config.ts. So for now only local pictures (starting with "/") are used.
// Anything else shows the emoji instead, until image hosting is decided.
function localImage(url: string | null): string | undefined {
    return url && url.startsWith("/") ? url : undefined;
}

function toCategory(category: ApiCategory): Category {
    return {
        id: category.slug,
        name: category.name,
        emoji: CATEGORY_EMOJI[category.slug] ?? DEFAULT_EMOJI,
        image: localImage(category.imageUrl),
        href: `/categories/${category.slug}`,
    };
}

function toProduct(product: ApiProduct): Product {
    const categoryId = product.categorySlug ?? "";

    return {
        id: product.slug,
        name: product.name,
        description: product.description ?? undefined,
        categoryId,
        price: product.price,
        oldPrice: product.oldPrice ?? undefined,
        rating: product.rating,
        reviewCount: product.reviewCount,
        stock: product.stock,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        emoji: CATEGORY_EMOJI[categoryId] ?? DEFAULT_EMOJI,
        image: localImage(product.imageUrl),
        href: `/products/${product.slug}`,
    };
}

// Always ask the server for fresh data, so a price or stock change shows up at once.
const FRESH: RequestInit = { cache: "no-store" };

// ---------- Fetchers ----------

export async function getCategories(): Promise<Category[]> {
    const response = await apiFetch<ListResponse<ApiCategory>>("/categories", FRESH);

    return response.data.map(toCategory);
}

// `search` is the text from the search box. The backend matches it against the
// product name, description and category.
export async function getProducts(
    categorySlug?: string,
    search?: string,
): Promise<Product[]> {
    const params = new URLSearchParams();

    if (categorySlug) params.set("category", categorySlug);
    if (search) params.set("q", search);

    const queryString = params.toString();
    const query = queryString ? `?${queryString}` : "";

    const response = await apiFetch<ListResponse<ApiProduct>>(
        `/products${query}`,
        FRESH,
    );

    return response.data.map(toProduct);
}

// Returns null when the product does not exist (so the page can show "not found").
export async function getProduct(slug: string): Promise<Product | null> {
    try {
        const response = await apiFetch<OneResponse<ApiProduct>>(
            `/products/${encodeURIComponent(slug)}`,
            FRESH,
        );

        return toProduct(response.data);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return null;
        }

        throw error;
    }
}

export async function getFaqs(): Promise<Faq[]> {
    const response = await apiFetch<ListResponse<Faq>>("/faqs", FRESH);

    return response.data;
}

export async function getTestimonials(): Promise<Testimonial[]> {
    const response = await apiFetch<ListResponse<Testimonial>>(
        "/testimonials",
        FRESH,
    );

    return response.data;
}

// The backend has no "popular" ranking yet, so this uses the products with the most
// reviews. With no reviews at all it simply keeps the server's order.
export function pickPopular(products: Product[], count = 5): Product[] {
    return [...products]
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, count);
}
