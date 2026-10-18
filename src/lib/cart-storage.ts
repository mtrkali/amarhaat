import { MAX_QUANTITY, type CartItem } from "./features/cartSlice";

const STORAGE_KEY = "amar-haat-cart";

function isCartItem(value: unknown): value is CartItem {
    if (typeof value !== "object" || value === null) return false;

    const item = value as Record<string, unknown>;

    return (
        typeof item.productId === "string" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1
    );
}

// Anything save in the browser can be editted by the visitor so check it before use.

export function sanitizeCartItems(raw: unknown): CartItem[] {
    if (!Array.isArray(raw)) return [];

    const merged = new Map<string, number>();

    for (const entry of raw) {
        if (!isCartItem(entry)) continue;

        merged.set(entry.productId,
            Math.min(MAX_QUANTITY, (merged.get(entry.productId) ?? 0) + entry.quantity),
        );
    }

    return Array.from(merged, ([productId, quantity]) => ({
        productId,
        quantity,
    }));
}

export function loadCart(): CartItem[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? sanitizeCartItems(JSON.parse(raw)) : [];
    } catch {
        return [];
    }
}

export function saveCart(items: CartItem[]) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Storage can be full or blocked. the cart still works until the page closes
    }
}