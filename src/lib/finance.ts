import { apiFetch } from "./api";
const auth = (token: string): RequestInit => ({ cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
export type FinanceOrder = { id: number; orderNumber: string; customerName: string; customerPhone: string; amount: number };
export type EarnedCommission = { id: number; orderNumber: string; shopName: string; basisAmount: number; rateBps: number; amount: number };
export type AdminFinanceSummary = {
    pendingCod: number; collectedCod: number; paid: number; failed: number;
    commissions: { pending: number; earned: number; settled: number; reversed: number };
    deliveredSales: number; deliveredDeliveryFees: number; pendingCodOrders: FinanceOrder[]; earnedCommissions: EarnedCommission[];
    commissionPolicy: { defaultRateBps: number; basis: "SUBTOTAL" | "SUBTOTAL_PLUS_DELIVERY" };
};
export async function fetchAdminFinance(token: string) {
    const result = await apiFetch<{ success: boolean; data: AdminFinanceSummary }>("/finance/admin", auth(token));
    return result.data;
}
export function collectCod(token: string, orderId: number, reference: string) {
    return apiFetch(`/finance/orders/${orderId}/cod-collection`, { ...auth(token), method: "PATCH", body: JSON.stringify({ reference: reference.trim() || null }) });
}
export function settleCommission(token: string, commissionId: number, reference: string) {
    return apiFetch(`/finance/commissions/${commissionId}/settlement`, { ...auth(token), method: "PATCH", body: JSON.stringify({ reference: reference.trim() || null }) });
}
