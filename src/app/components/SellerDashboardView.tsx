"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import {
    createSellerProduct,
    describeError,
    fetchSellerDashboard,
    isSessionError,
    updateSellerStock,
    type SellerDashboard,
} from "../../lib/auth";
import { getCategories, type Category } from "../../lib/catalog";
import { clearToken } from "../../lib/auth-storage";
import { selectAuthStatus, selectAuthToken, selectAuthUser, sessionEnded } from "../../lib/features/authSlice";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { setProductDeliveryMethods, type DeliveryMethod } from "../../lib/delivery";

const card = "rounded-2xl border border-border bg-card p-5";
const button = "inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60";

const statusLabels: Record<string, string> = {
    PENDING: "নতুন অর্ডার",
    CONFIRMED: "নিশ্চিত",
    PROCESSING: "প্রস্তুত হচ্ছে",
    READY_FOR_DELIVERY: "ডেলিভারির জন্য প্রস্তুত",
    SHIPPED: "পাঠানো হয়েছে",
    OUT_FOR_DELIVERY: "ডেলিভারির পথে",
    DELIVERED: "ডেলিভারি সম্পন্ন",
    CANCELLED: "বাতিল",
    REJECTED: "প্রত্যাখ্যাত",
};

function money(value: number) {
    return `৳${value.toLocaleString("en-BD")}`;
}

export default function SellerDashboardView() {
    const dispatch = useAppDispatch();
    const authStatus = useAppSelector(selectAuthStatus);
    const token = useAppSelector(selectAuthToken);
    const user = useAppSelector(selectAuthUser);
    const [dashboard, setDashboard] = useState<SellerDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [drafts, setDrafts] = useState<Record<number, string>>({});
    const [savingId, setSavingId] = useState<number | null>(null);
    const [notice, setNotice] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [newProduct, setNewProduct] = useState({ slug: "", name: "", categorySlug: "", price: "", stock: "", description: "", imageUrl: "" });
    const [creatingProduct, setCreatingProduct] = useState(false);

    const endSession = useCallback(() => {
        clearToken();
        dispatch(sessionEnded());
    }, [dispatch]);

    const refresh = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError("");
        try {
            const data = await fetchSellerDashboard(token);
            setDashboard(data);
            setDrafts(Object.fromEntries(data.products.map((product) => [product.id, String(product.stock)])));
        } catch (caught) {
            if (isSessionError(caught)) endSession();
            else setError(describeError(caught));
        } finally {
            setLoading(false);
        }
    }, [token, endSession]);

    useEffect(() => {
        if (authStatus === "authenticated" && user?.role === "SELLER") void refresh();
        else if (authStatus !== "loading") setLoading(false);
    }, [authStatus, user?.role, refresh]);

    useEffect(() => {
        if (authStatus === "authenticated" && user?.role === "SELLER") {
            void getCategories().then(setCategories).catch(() => setCategories([]));
        }
    }, [authStatus, user?.role]);

    async function saveStock(event: FormEvent<HTMLFormElement>, productId: number) {
        event.preventDefault();
        if (!token || savingId !== null) return;
        const stock = Number(drafts[productId]);
        if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
            setNotice("স্টক ০ থেকে ১০,০০,০০০-এর মধ্যে পূর্ণসংখ্যা হতে হবে।");
            return;
        }
        setSavingId(productId);
        setNotice("");
        try {
            const updated = await updateSellerStock(token, productId, stock);
            setDashboard((current) => current ? {
                ...current,
                products: current.products.map((product) => product.id === productId ? updated : product),
                overview: {
                    ...current.overview,
                    lowStockProducts: current.products.filter((product) => product.id !== productId).concat(updated).filter((product) => product.stock > 0 && product.stock <= 5).length,
                    outOfStockProducts: current.products.filter((product) => product.id !== productId).concat(updated).filter((product) => product.stock === 0).length,
                },
            } : current);
            setDrafts((current) => ({ ...current, [productId]: String(updated.stock) }));
            setNotice("স্টক আপডেট হয়েছে।");
        } catch (caught) {
            if (isSessionError(caught)) endSession();
            else setNotice(caught instanceof ApiError && caught.status === 404 ? "পণ্যটি আপনার দোকানের নয় বা আর নেই।" : describeError(caught));
        } finally {
            setSavingId(null);
        }
    }

    async function addProduct(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token || creatingProduct) return;
        const price = Number(newProduct.price);
        const stock = Number(newProduct.stock);
        if (!Number.isInteger(price) || price < 1 || !Number.isInteger(stock) || stock < 0 || !newProduct.categorySlug) {
            setNotice("পণ্যের ক্যাটাগরি, দাম ও সঠিক স্টক পূরণ করুন।");
            return;
        }
        setCreatingProduct(true);
        setNotice("");
        try {
            await createSellerProduct(token, {
                slug: newProduct.slug.trim(),
                name: newProduct.name.trim(),
                categorySlug: newProduct.categorySlug,
                price,
                stock,
                ...(newProduct.description.trim() ? { description: newProduct.description.trim() } : {}),
                ...(newProduct.imageUrl.trim() ? { imageUrl: newProduct.imageUrl.trim() } : {}),
            });
            setNewProduct({ slug: "", name: "", categorySlug: "", price: "", stock: "", description: "", imageUrl: "" });
            setNotice("নতুন পণ্য যোগ হয়েছে।");
            await refresh();
        } catch (caught) {
            if (isSessionError(caught)) endSession();
            else setNotice(caught instanceof ApiError && caught.errors ? Object.values(caught.errors).join(" ") : describeError(caught));
        } finally {
            setCreatingProduct(false);
        }
    }

    if (authStatus === "loading" || loading) {
        return <p role="status" className={`${card} text-center text-muted-foreground`}>ড্যাশবোর্ড লোড হচ্ছে…</p>;
    }

    if (authStatus !== "authenticated" || !token) {
        return <div className={`${card} text-center`}><p className="font-semibold">ড্যাশবোর্ড দেখতে লগইন করুন।</p><Link href="/login?next=%2Fseller%2Fdashboard" className={`${button} mt-4`}>লগইন</Link></div>;
    }

    if (user?.role !== "SELLER") {
        return <div className={`${card} text-center`}><p className="font-semibold">এই অ্যাকাউন্টে অনুমোদিত seller dashboard নেই।</p><p className="mt-2 text-sm text-muted-foreground">দোকানের আবেদন অনুমোদিত হলে seller dashboard ব্যবহার করতে পারবেন।</p><Link href="/sell" className={`${button} mt-4`}>দোকানের অবস্থা দেখুন</Link></div>;
    }

    if (error || !dashboard) {
        return <div role="alert" className={`${card} text-center`}><p className="text-sm text-error">{error || "ড্যাশবোর্ড আনা যায়নি।"}</p><button type="button" onClick={() => void refresh()} className={`${button} mt-4`}>আবার চেষ্টা করুন</button></div>;
    }

    const overviewCards = [
        ["মোট পণ্য", dashboard.overview.totalProducts],
        ["স্টক কম (১–৫)", dashboard.overview.lowStockProducts],
        ["স্টক শেষ", dashboard.overview.outOfStockProducts],
        ["মোট অর্ডার", dashboard.overview.totalOrders],
        ["নতুন অর্ডার", dashboard.overview.pendingOrders],
        ["ডেলিভারি সম্পন্ন", dashboard.overview.deliveredOrders],
    ] as const;

    return (
        <div className="space-y-7">
            <section className={`${card} flex flex-wrap items-center justify-between gap-4`}>
                <div><p className="text-sm text-muted-foreground">Seller dashboard</p><h2 className="mt-1 text-2xl font-bold">{dashboard.shop.shopName}</h2></div>
                <p className="rounded-full bg-surface-green px-4 py-2 text-sm font-semibold text-primary">অনুমোদিত দোকান</p>
            </section>

            <nav aria-label="Seller dashboard sections" className="flex flex-wrap gap-2">
                {[["#overview", "ওভারভিউ"], ["#products", "পণ্য ও স্টক"], ["#orders", "অর্ডার"]].map(([href, label]) => <a key={href} href={href} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-primary">{label}</a>)}
            </nav>

            <section id="overview" aria-labelledby="seller-overview-heading" className="space-y-4 scroll-mt-28">
                <h2 id="seller-overview-heading" className="text-xl font-bold">ওভারভিউ</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {overviewCards.map(([label, value]) => <article key={label} className={card}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></article>)}
                    <article className={card}><p className="text-sm text-muted-foreground">ডেলিভারি হওয়া পণ্যের বিক্রয়</p><p className="mt-2 text-2xl font-bold">{money(dashboard.financialSummary.deliveredSales)}</p></article>
                    <article className={card}><p className="text-sm text-muted-foreground">আদায় হওয়া COD</p><p className="mt-2 text-2xl font-bold">{money(dashboard.financialSummary.collectedCod)}</p></article>
                    <article className={card}><p className="text-sm text-muted-foreground">বাকি COD</p><p className="mt-2 text-2xl font-bold">{money(dashboard.financialSummary.pendingCod)}</p></article>
                    <article className={card}><p className="text-sm text-muted-foreground">Earned commission</p><p className="mt-2 text-2xl font-bold">{money(dashboard.financialSummary.commissionEarned)}</p></article>
                    <article className={card}><p className="text-sm text-muted-foreground">Pending commission</p><p className="mt-2 text-2xl font-bold">{money(dashboard.financialSummary.commissionPending)}</p></article>
                    <article className={card}><p className="text-sm text-muted-foreground">Settled commission</p><p className="mt-2 text-2xl font-bold">{money(dashboard.financialSummary.commissionSettled)}</p></article>
                    <article className={card}><p className="text-sm text-muted-foreground">Seller net (delivery fee বাদে)</p><p className="mt-2 text-2xl font-bold">{money(dashboard.financialSummary.sellerNetBeforeDeliveryFee)}</p></article>
                </div>
            </section>

            <section id="products" aria-labelledby="seller-products-heading" className="space-y-4 scroll-mt-28">
                <div><h2 id="seller-products-heading" className="text-xl font-bold">পণ্য ও স্টক</h2><p className="mt-1 text-sm text-muted-foreground">শুধু আপনার দোকানের পণ্য এখানে দেখানো হয়।</p></div>
                {notice && <p role="status" className="text-sm font-medium text-primary">{notice}</p>}
                <details className={card}>
                    <summary className="cursor-pointer font-semibold">নতুন পণ্য যোগ করুন</summary>
                    <form onSubmit={(event) => void addProduct(event)} className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1 text-sm"><span>পণ্যের নাম</span><input required minLength={2} maxLength={120} value={newProduct.name} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} className="h-11 w-full rounded-lg border border-border bg-input px-3" /></label>
                        <label className="space-y-1 text-sm"><span>পণ্যের URL slug</span><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={60} placeholder="fresh-tomato" value={newProduct.slug} onChange={(event) => setNewProduct((current) => ({ ...current, slug: event.target.value }))} className="h-11 w-full rounded-lg border border-border bg-input px-3" /></label>
                        <label className="space-y-1 text-sm"><span>ক্যাটাগরি</span><select required value={newProduct.categorySlug} onChange={(event) => setNewProduct((current) => ({ ...current, categorySlug: event.target.value }))} className="h-11 w-full rounded-lg border border-border bg-input px-3"><option value="">ক্যাটাগরি বেছে নিন</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                        <label className="space-y-1 text-sm"><span>দাম (৳)</span><input required type="number" min="1" max="10000000" step="1" value={newProduct.price} onChange={(event) => setNewProduct((current) => ({ ...current, price: event.target.value }))} className="h-11 w-full rounded-lg border border-border bg-input px-3" /></label>
                        <label className="space-y-1 text-sm"><span>প্রাথমিক স্টক</span><input required type="number" min="0" max="1000000" step="1" value={newProduct.stock} onChange={(event) => setNewProduct((current) => ({ ...current, stock: event.target.value }))} className="h-11 w-full rounded-lg border border-border bg-input px-3" /></label>
                        <label className="space-y-1 text-sm"><span>ছবির URL (ঐচ্ছিক)</span><input type="url" maxLength={500} value={newProduct.imageUrl} onChange={(event) => setNewProduct((current) => ({ ...current, imageUrl: event.target.value }))} className="h-11 w-full rounded-lg border border-border bg-input px-3" /></label>
                        <label className="space-y-1 text-sm sm:col-span-2"><span>বিবরণ (ঐচ্ছিক)</span><textarea maxLength={1000} rows={3} value={newProduct.description} onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-lg border border-border bg-input px-3 py-2" /></label>
                        <button type="submit" disabled={creatingProduct || categories.length === 0} className={`${button} sm:col-span-2`}>{creatingProduct ? "যোগ হচ্ছে…" : "পণ্য যোগ করুন"}</button>
                    </form>
                </details>
                {dashboard.products.length === 0 ? <div className={card}><p className="text-sm text-muted-foreground">এখনো কোনো পণ্য নেই।</p></div> : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        <div className="hidden grid-cols-[minmax(0,1fr)_7rem_9rem_8rem] gap-4 border-b border-border px-5 py-3 text-xs font-semibold text-muted-foreground md:grid"><span>পণ্য</span><span>দাম</span><span>স্টক</span><span>অবস্থা</span></div>
                        <ul className="divide-y divide-border">{dashboard.products.map((product) => (
                            <li key={product.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_7rem_9rem_8rem] md:items-center md:px-5">
                                <div><p className="font-semibold">{product.name}</p><p className="text-xs text-muted-foreground">/{product.slug}</p><div className="mt-2 flex flex-wrap gap-2">{(["PLATFORM_RIDER", "SELLER", "PICKUP"] as DeliveryMethod[]).map((method) => <label key={method} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={product.deliveryMethods?.includes(method) ?? method === "SELLER"} onChange={async (event) => { if (!token) return; const next = new Set(product.deliveryMethods ?? ["SELLER"]); event.target.checked ? next.add(method) : next.delete(method); if (next.size === 0) { setNotice("অন্তত একটি ডেলিভারি পদ্ধতি রাখুন।"); return; } try { await setProductDeliveryMethods(token, product.id, [...next]); await refresh(); setNotice("পণ্যের ডেলিভারি পদ্ধতি সেভ হয়েছে。"); } catch { setNotice("ডেলিভারি পদ্ধতি সেভ হয়নি।"); } }} />{method === "PLATFORM_RIDER" ? "Platform rider" : method === "SELLER" ? "Seller delivery" : "Pickup"}</label>)}</div></div>
                                <p className="text-sm text-muted-foreground md:text-foreground">দাম: {money(product.price)}</p>
                                <form onSubmit={(event) => void saveStock(event, product.id)} className="flex gap-2">
                                    <label className="sr-only" htmlFor={`stock-${product.id}`}>স্টক: {product.name}</label>
                                    <input id={`stock-${product.id}`} type="number" min="0" max="1000000" step="1" value={drafts[product.id] ?? product.stock} onChange={(event) => setDrafts((current) => ({ ...current, [product.id]: event.target.value }))} className="h-10 w-24 rounded-lg border border-border bg-input px-3 text-sm" />
                                    <button type="submit" disabled={savingId === product.id} className={button}>{savingId === product.id ? "…" : "সেভ"}</button>
                                </form>
                                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${!product.isActive ? "bg-muted text-muted-foreground" : product.stock === 0 ? "bg-error/10 text-error" : product.stock <= 5 ? "bg-amber-100 text-amber-800" : "bg-surface-green text-primary"}`}>{!product.isActive ? "নিষ্ক্রিয়" : product.stock === 0 ? "স্টক শেষ" : product.stock <= 5 ? "স্টক কম" : "সক্রিয়"}</span>
                            </li>
                        ))}</ul>
                    </div>
                )}
            </section>

            <section id="orders" aria-labelledby="seller-orders-heading" className="space-y-4 scroll-mt-28">
                <div><h2 id="seller-orders-heading" className="text-xl font-bold">অর্ডার</h2><p className="mt-1 text-sm text-muted-foreground">আপনার পণ্যের অর্ডার, ক্রেতা ও অর্ডার অবস্থা।</p></div>
                {dashboard.orders.length === 0 ? <div className={card}><p className="text-sm text-muted-foreground">এখনো কোনো অর্ডার আসেনি।</p></div> : <div className="space-y-3">{dashboard.orders.map((order) => (
                    <article key={order.id} className={card}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div><p className="font-bold">{order.orderNumber}</p><p className="mt-1 text-sm text-muted-foreground">{order.customerName} · {order.customerPhone}</p><p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("bn-BD")}</p></div>
                            <span className="rounded-full bg-surface-green px-3 py-1 text-xs font-semibold text-primary">{statusLabels[order.status] ?? order.status}</span>
                        </div>
                        <ul className="mt-4 divide-y divide-border border-y border-border">{order.items.map((item) => <li key={item.id} className="flex justify-between gap-3 py-2 text-sm"><span>{item.productName} × {item.quantity}</span><span className="font-medium">{money(item.lineTotal)}</span></li>)}</ul>
                        <div className="mt-3 flex justify-between text-sm"><span className="text-muted-foreground">অর্ডারের মোট</span><span className="font-bold">{money(order.total)}</span></div>
                    </article>
                ))}</div>}
            </section>
        </div>
    );
}
