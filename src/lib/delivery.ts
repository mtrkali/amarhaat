import { apiFetch } from "./api";

export type DeliveryMethod = "PLATFORM_RIDER" | "SELLER" | "PICKUP";
export type MethodSetting = { method: DeliveryMethod; enabled: boolean; fee: number };
export type Rider = { id: number; userId: number; name: string; phone: string; verificationStatus: "PENDING" | "VERIFIED" | "REJECTED"; isAvailable: boolean };
export type DeliveryOrder = { id: number; orderId: number; orderNumber: string; status: string; customerName: string; customerPhone: string; upazila: string; union: string; address: string; total: number };
const auth = (token: string): RequestInit => ({ cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
type Data<T> = { success: boolean; data: T };
export const fetchMethods = () => apiFetch<Data<MethodSetting[]>>("/delivery/methods", { cache: "no-store" }).then((x) => x.data);
export const saveMethods = (token: string, methods: MethodSetting[]) => apiFetch<Data<MethodSetting[]>>("/delivery/methods", { ...auth(token), method: "PATCH", body: JSON.stringify({ methods }) }).then((x) => x.data);
export const fetchRiders = (token: string) => apiFetch<Data<Rider[]>>("/delivery/riders", auth(token)).then((x) => x.data);
export const createRider = (token: string, userId: number) => apiFetch("/delivery/riders", { ...auth(token), method: "POST", body: JSON.stringify({ userId }) });
export const verifyRider = (token: string, id: number, status: Rider["verificationStatus"]) => apiFetch(`/delivery/riders/${id}/verification`, { ...auth(token), method: "PATCH", body: JSON.stringify({ status }) });
export const assignRider = (token: string, orderId: number, riderId: number) => apiFetch(`/delivery/orders/${orderId}/assign`, { ...auth(token), method: "POST", body: JSON.stringify({ riderId }) });
export const fetchRiderDashboard = (token: string) => apiFetch<Data<{ rider: { isAvailable: boolean }; deliveries: DeliveryOrder[] }>>("/delivery/rider/dashboard", auth(token)).then((x) => x.data);
export const setRiderAvailability = (token: string, isAvailable: boolean) => apiFetch("/delivery/rider/availability", { ...auth(token), method: "PATCH", body: JSON.stringify({ isAvailable }) });
export const setRiderDeliveryStatus = (token: string, id: number, status: string) => apiFetch(`/delivery/rider/deliveries/${id}/status`, { ...auth(token), method: "PATCH", body: JSON.stringify({ status }) });
export const setProductDeliveryMethods = (token: string, id: number, methods: DeliveryMethod[]) => apiFetch(`/delivery/products/${id}/methods`, { ...auth(token), method: "PATCH", body: JSON.stringify({ methods }) });
export const fetchProductOptions = (slugs: string[]) => apiFetch<Data<{ methods: MethodSetting[]; products: { slug: string; sellerId: number | null; deliveryMethods: DeliveryMethod[] }[] }>>(`/delivery/options?slugs=${encodeURIComponent(slugs.join(","))}`, { cache: "no-store" }).then((x) => x.data);
