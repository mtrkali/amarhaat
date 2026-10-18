import type { CheckoutValues } from "./checkout";

export type OrderRequest = {
    customer: CheckoutValues
    // Only ids and quantities are sent. The server must look up the prices itself
    // and never trust prices that come from the browser.
    items: { productId: string, quantity: number }[];
}

export type OrderResult =
    | { ok: true; orderId: string }
    | { ok: false; message: string }

// TODO: connect this to the backend. The backend has no orders API yet, so for now
// this does NOT send the order anywhere. It only reports that honestly to the customer.
export async function placeOrder(request: OrderRequest): Promise<OrderResult> {
    void request;
    return {
        ok: false,
        message:
            "অর্ডার নেওয়ার ব্যবস্থা এখনো চালু হয়নি, তাই আপনার অর্ডার পাঠানো হয়নি। আপনার কার্ট ও দেওয়া তথ্য যেমন আছে তেমনই থাকছে।",
    };
}