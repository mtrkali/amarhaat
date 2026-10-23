import { ApiError, apiFetch } from "./api";
import { clearToken, loadToken } from "./auth-storage";
import type { CheckoutValues } from "./checkout";

export type OrderRequest = {
    customer: CheckoutValues;
    // Only product ids (slugs) and quantities are sent. The server looks up the prices
    // itself and never trusts prices that come from the browser.
    items: { productId: string; quantity: number }[];
};

// What the backend returns for a placed order (only the parts the site uses).
export type PlacedOrder = {
    orderNumber: string;
    groupNumber?: string;
    trackingToken?: string;
    status: string;
    customerName: string;
    customerPhone: string;
    upazila: string;
    union: string;
    address: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
    createdAt: string;
    items: {
        id: number;
        productName: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
    }[];
    orders?: {
        orderNumber: string;
        sellerId: number | null;
        sellerName: string;
        status: string;
        subtotal: number;
        deliveryFee: number;
        total: number;
        upazila: string;
        union: string;
        address: string;
        items: PlacedOrder["items"];
    }[];
};

type PlacedOrderGroup = Omit<PlacedOrder, "items"> & {
    groupNumber: string;
    trackingToken?: string;
    orders: NonNullable<PlacedOrder["orders"]>;
};

function orderFromGroup(group: PlacedOrderGroup): PlacedOrder {
    const firstOrder = group.orders[0];
    return {
        ...group,
        orderNumber: group.groupNumber,
        status: firstOrder?.status ?? "PENDING",
        upazila: firstOrder?.upazila ?? group.upazila,
        union: firstOrder?.union ?? group.union,
        address: firstOrder?.address ?? group.address,
        items: group.orders.flatMap((order) => order.items),
    };
}

export type OrderResult =
    | { ok: true; order: PlacedOrder }
    // stockProblem: the cart is probably out of date, so the caller should reload the catalog.
    | { ok: false; message: string; stockProblem: boolean };

function failureMessage(error: ApiError): string {
    if (error.status === 0) {
        return "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট দেখে আবার চেষ্টা করুন।";
    }

    if (error.status === 429) {
        return "অল্প সময়ে অনেকবার অর্ডারের চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
    }

    if (error.code === "OUT_OF_STOCK") {
        return "কার্টের কোনো পণ্যের স্টক কমে গেছে বা শেষ হয়ে গেছে। কার্ট দেখে নিয়ে আবার চেষ্টা করুন।";
    }

    if (error.code === "PRODUCT_UNAVAILABLE") {
        return "কার্টের কোনো পণ্য এখন আর পাওয়া যাচ্ছে না। কার্ট দেখে নিয়ে আবার চেষ্টা করুন।";
    }

    if (error.status === 400) {
        return "অর্ডারের তথ্যে সমস্যা আছে। ফর্মের তথ্যগুলো আবার দেখে নিন।";
    }

    return "অর্ডার পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
}

// One random key per checkout attempt. If the answer to an order is lost (bad connection, timeout),
// the customer taps "order" again and the SAME key is sent, so the server returns the first order
// instead of creating a second one. The key is dropped as soon as the outcome is certain.
let pendingAttempt: { key: string; body: string } | null = null;

function randomKey(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);

    crypto.getRandomValues(bytes);

    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function keyFor(body: string): string {
    // A different cart or different details must never reuse an old key.
    if (!pendingAttempt || pendingAttempt.body !== body) {
        pendingAttempt = { key: randomKey(), body };
    }

    return pendingAttempt.key;
}

export async function placeOrder(request: OrderRequest): Promise<OrderResult> {
    const { customer } = request;

    const body = JSON.stringify({
        customer: {
            name: customer.name,
            phone: customer.phone,
            upazila: customer.upazila,
            union: customer.union,
            ward: customer.ward,
            address: customer.address,
            note: customer.note,
        },
        items: request.items.map((item) => ({
            productSlug: item.productId,
            quantity: item.quantity,
        })),
    });

    // A logged-in customer's token goes with the order, so it shows up in their profile.
    const idempotencyKey = keyFor(body);

    function send(token: string | null) {
        return apiFetch<{ success: boolean; data: PlacedOrder }>("/orders", {
            method: "POST",
            headers: {
                "Idempotency-Key": idempotencyKey,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body,
        });
    }

    try {
        const token = loadToken();
        let response;

        try {
            response = await send(token);
        } catch (error) {
            // An expired login must not stop a customer from ordering. Forget it and order as a guest.
            const loginRejected =
                token !== null &&
                error instanceof ApiError &&
                (error.status === 401 || error.status === 403);

            if (!loginRejected) throw error;

            clearToken();
            response = await send(null);
        }

        pendingAttempt = null; // the order exists, the key has done its job
        const group = response.data as PlacedOrderGroup;
        return { ok: true, order: orderFromGroup(group) };
    } catch (error) {
        // Keep the key only when we cannot tell whether the order was saved
        // (no answer from the server, or a server error). Any clear "no" starts fresh next time.
        const outcomeUnknown =
            error instanceof ApiError
                ? error.status === 0 || error.status >= 500
                : true;

        if (!outcomeUnknown) {
            pendingAttempt = null;
        }

        if (error instanceof ApiError) {
            return {
                ok: false,
                message: failureMessage(error),
                stockProblem:
                    error.code === "OUT_OF_STOCK" ||
                    error.code === "PRODUCT_UNAVAILABLE",
            };
        }

        return {
            ok: false,
            message: "অর্ডার পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
            stockProblem: false,
        };
    }
}

// ---------- Order tracking (for guests, no login needed) ----------

export type TrackResult =
    | { ok: true; order: PlacedOrder }
    | { ok: false; message: string };

// Looks an order up by its number AND the phone number used for it.
export async function trackOrder(
    orderNumber: string,
    phone: string,
): Promise<TrackResult> {
    try {
        const response = await apiFetch<{ success: boolean; data: PlacedOrder }>(
            `/orders/track/${encodeURIComponent(orderNumber)}?phone=${encodeURIComponent(phone)}`,
            { cache: "no-store" },
        );

        const group = response.data as PlacedOrderGroup;
        return { ok: true, order: orderFromGroup(group) };
    } catch (error) {
        if (error instanceof ApiError) {
            if (error.status === 404) {
                return {
                    ok: false,
                    message:
                        "এই অর্ডার নম্বর ও মোবাইল নম্বরের সাথে মেলে এমন কোনো অর্ডার পাওয়া যায়নি। দুটোই আবার দেখে নিন।",
                };
            }

            if (error.status === 429) {
                return {
                    ok: false,
                    message: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
                };
            }

            if (error.status === 0) {
                return {
                    ok: false,
                    message:
                        "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট দেখে আবার চেষ্টা করুন।",
                };
            }
        }

        return {
            ok: false,
            message: "অর্ডারের তথ্য আনা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
        };
    }
}

export async function trackOrderWithToken(token: string): Promise<TrackResult> {
    try {
        const response = await apiFetch<{ success: boolean; data: PlacedOrderGroup }>(
            `/orders/track/token?token=${encodeURIComponent(token)}`,
            { cache: "no-store" },
        );
        const group = response.data;
        return { ok: true, order: orderFromGroup(group) };
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return { ok: false, message: "এই ট্র্যাকিং লিংকটি সঠিক নয় বা আর কাজ করছে না।" };
        }
        return { ok: false, message: "অর্ডারের তথ্য আনা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।" };
    }
}

// The steps an order moves through. CANCELLED is handled separately.
export const ORDER_STEPS: { status: string; label: string }[] = [
    { status: "PENDING", label: "অর্ডার গ্রহণ" },
    { status: "CONFIRMED", label: "নিশ্চিত" },
    { status: "OUT_FOR_DELIVERY", label: "ডেলিভারির পথে" },
    { status: "DELIVERED", label: "পৌঁছেছে" },
];
