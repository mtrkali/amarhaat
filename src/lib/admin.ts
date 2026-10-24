import { apiFetch } from "./api";
import type { AuthUser } from "./auth";

export type AdminSeller = { id: number; userId: number; slug: string; shopName: string; status: "PENDING" | "APPROVED" | "SUSPENDED"; commissionBps: number | null; };
export type AdminCategory = { id: number; slug: string; name: string; imageUrl: string | null; description: string | null; parentId: number | null; sortOrder: number; isActive: boolean; };
export type AdminProduct = { id: number; slug: string; name: string; price: number; stock: number; isActive: boolean; sellerId: number | null; categorySlug: string | null; };
export type AdminOrder = { id: number; orderNumber: string; sellerId: number | null; customerName: string; customerPhone: string; total: number; status: string; createdAt: string; };
export type AdminData = { sellers: AdminSeller[]; users: AuthUser[]; categories: AdminCategory[]; products: AdminProduct[]; orders: AdminOrder[]; };

type Response<T> = { success: boolean; data: T };
const auth = (token: string): RequestInit => ({ cache: "no-store", headers: { Authorization: `Bearer ${token}` } });

export async function fetchAdminData(token: string): Promise<AdminData> {
    const options = auth(token);
    const [sellers, users, categories, products, orders] = await Promise.all([
        apiFetch<Response<AdminSeller[]>>("/sellers", options),
        apiFetch<Response<AuthUser[]>>("/users", options),
        apiFetch<Response<AdminCategory[]>>("/categories/manage", options),
        apiFetch<Response<AdminProduct[]>>("/products/manage", options),
        apiFetch<Response<AdminOrder[]>>("/orders", options),
    ]);
    return { sellers: sellers.data, users: users.data, categories: categories.data, products: products.data, orders: orders.data };
}

export function setSellerStatus(token: string, id: number, status: AdminSeller["status"]) {
    return apiFetch(`/sellers/${id}/status`, { ...auth(token), method: "PATCH", body: JSON.stringify({ status }) });
}

export function setSellerCommission(token: string, id: number, commissionBps: number | null) {
    return apiFetch(`/sellers/${id}/commission`, { ...auth(token), method: "PATCH", body: JSON.stringify({ commissionBps }) });
}

export function setUserStatus(token: string, id: number, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") {
    return apiFetch(`/users/${id}/status`, { ...auth(token), method: "PATCH", body: JSON.stringify({ status }) });
}

export type CategoryInput = Omit<AdminCategory, "id">;
export function saveCategory(token: string, input: CategoryInput, id?: number) {
    return apiFetch(id ? `/categories/${id}` : "/categories", {
        ...auth(token), method: id ? "PATCH" : "POST", body: JSON.stringify(input),
    });
}

export function updateAdminProduct(token: string, id: number, changes: Partial<Pick<AdminProduct, "price" | "stock" | "isActive">>) {
    return apiFetch(`/products/${id}`, { ...auth(token), method: "PATCH", body: JSON.stringify(changes) });
}

export function setOrderStatus(token: string, id: number, status: string) {
    return apiFetch(`/orders/${id}/status`, { ...auth(token), method: "PATCH", body: JSON.stringify({ status }) });
}
