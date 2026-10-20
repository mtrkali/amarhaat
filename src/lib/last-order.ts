import type { PlacedOrder } from "./orders";

// Remembers the order that was just placed, only for this browser tab, so the
// "order placed" page can show it. It is cleared when the tab is closed.
const STORAGE_KEY = "amar-haat-last-order";

export function saveLastOrder(order: PlacedOrder) {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    } catch {
        // Storage can be blocked. The order is still placed, the page just shows less.
    }
}

export function loadLastOrder(): PlacedOrder | null {
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);

        if (!raw) return null;

        const value = JSON.parse(raw) as Partial<PlacedOrder> | null;

        // Anything saved in the browser can be edited, so check the basics.
        if (
            !value ||
            typeof value.orderNumber !== "string" ||
            typeof value.total !== "number" ||
            !Array.isArray(value.items)
        ) {
            return null;
        }

        return value as PlacedOrder;
    } catch {
        return null;
    }
}