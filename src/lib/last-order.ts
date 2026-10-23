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

        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

        // Accept both the normalized checkout shape and a raw multi-seller API group.
        const envelope = parsed as Record<string, unknown>;
        const value = envelope["data"] && typeof envelope["data"] === "object"
            ? envelope["data"] as Record<string, unknown>
            : envelope;
        const children = Array.isArray(value["orders"])
            ? value["orders"].filter((order): order is Record<string, unknown> => Boolean(order) && typeof order === "object")
            : [];
        const childItems = children.flatMap((child) => Array.isArray(child["items"]) ? child["items"] : []);
        const items = Array.isArray(value["items"]) ? value["items"] : childItems;
        const orderNumber = typeof value["orderNumber"] === "string"
            ? value["orderNumber"]
            : typeof value["groupNumber"] === "string" ? value["groupNumber"] : null;
        const total = Number(value["total"]);

        // Anything saved in the browser can be edited, so check the basics.
        if (!orderNumber || !Number.isFinite(total) || items.length === 0) return null;

        const firstChild = children[0] ?? {};
        return {
            ...value,
            orderNumber,
            groupNumber: typeof value["groupNumber"] === "string" ? value["groupNumber"] : undefined,
            total,
            subtotal: Number(value["subtotal"] ?? children.reduce((sum, child) => sum + Number(child["subtotal"] ?? 0), 0)),
            deliveryFee: Number(value["deliveryFee"] ?? children.reduce((sum, child) => sum + Number(child["deliveryFee"] ?? 0), 0)),
            customerName: String(value["customerName"] ?? firstChild["customerName"] ?? ""),
            customerPhone: String(value["customerPhone"] ?? firstChild["customerPhone"] ?? ""),
            upazila: String(value["upazila"] ?? firstChild["upazila"] ?? ""),
            union: String(value["union"] ?? firstChild["union"] ?? ""),
            address: String(value["address"] ?? firstChild["address"] ?? ""),
            createdAt: String(value["createdAt"] ?? firstChild["createdAt"] ?? ""),
            status: String(value["status"] ?? firstChild["status"] ?? "PENDING"),
            items: items as PlacedOrder["items"],
            orders: children as PlacedOrder["orders"],
        } as PlacedOrder;
    } catch {
        return null;
    }
}
