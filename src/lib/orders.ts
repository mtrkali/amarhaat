import { ApiError, apiFetch } from "./api";
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
};

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

export async function placeOrder(request: OrderRequest): Promise<OrderResult> {
    const { customer } = request;

    try {
        const response = await apiFetch<{ success: boolean; data: PlacedOrder }>(
            "/orders",
            {
                method: "POST",
                body: JSON.stringify({
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
                }),
            },
        );

        return { ok: true, order: response.data };
    } catch (error) {
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