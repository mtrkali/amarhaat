"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import { clearToken } from "../../lib/auth-storage";
import { selectAuthStatus, selectAuthToken, selectAuthUser, sessionEnded } from "../../lib/features/authSlice";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import {
    fetchAdminData, saveCategory, setOrderStatus, setSellerStatus, setUserStatus, updateAdminProduct,
    type AdminData, type AdminProduct, type CategoryInput,
} from "../../lib/admin";
import { describeError, isSessionError } from "../../lib/auth";

const card = "rounded-2xl border border-border bg-card p-5";
const button = "inline-flex min-h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50";
const input = "h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground";
const ORDER_STATUS_OPTIONS = ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

function money(value: number) { return `৳${value.toLocaleString("en-BD")}`; }

export default function AdminPanelView() {
    const dispatch = useAppDispatch();
    const authStatus = useAppSelector(selectAuthStatus);
    const token = useAppSelector(selectAuthToken);
    const user = useAppSelector(selectAuthUser);
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busyKey, setBusyKey] = useState("");
    const [productDrafts, setProductDrafts] = useState<Record<number, { price: string; stock: string; isActive: boolean }>>({});
    const [category, setCategory] = useState({ slug: "", name: "", imageUrl: "", description: "", sortOrder: "0" });
    const [categoryDrafts, setCategoryDrafts] = useState<Record<number, { name: string; sortOrder: string }>>({});

    const endSession = useCallback(() => { clearToken(); dispatch(sessionEnded()); }, [dispatch]);
    const refresh = useCallback(async () => {
        if (!token) return;
        setLoading(true); setError("");
        try {
            const result = await fetchAdminData(token);
            setData(result);
            setCategoryDrafts(Object.fromEntries(result.categories.map((item) => [item.id, { name: item.name, sortOrder: String(item.sortOrder) }])));
            setProductDrafts(Object.fromEntries(result.products.map((p) => [p.id, { price: String(p.price), stock: String(p.stock), isActive: p.isActive }])));
        } catch (caught) {
            if (isSessionError(caught)) endSession();
            else setError(describeError(caught));
        } finally { setLoading(false); }
    }, [token, endSession]);

    useEffect(() => {
        if (authStatus === "authenticated" && user?.role === "ADMIN") void refresh();
        else if (authStatus !== "loading") setLoading(false);
    }, [authStatus, user?.role, refresh]);

    async function mutate(key: string, action: () => Promise<unknown>, success: string) {
        setBusyKey(key); setNotice("");
        try { await action(); setNotice(success); await refresh(); }
        catch (caught) {
            if (isSessionError(caught)) endSession();
            else setNotice(caught instanceof ApiError && caught.errors ? Object.values(caught.errors).join(" ") : describeError(caught));
        } finally { setBusyKey(""); }
    }

    async function addCategory(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token) return;
        const inputData: CategoryInput = {
            slug: category.slug.trim(), name: category.name.trim(),
            imageUrl: category.imageUrl.trim() || null, description: category.description.trim() || null,
            parentId: null, sortOrder: Number(category.sortOrder), isActive: true,
        };
        await mutate("category-new", () => saveCategory(token, inputData), "ক্যাটাগরি যোগ হয়েছে।");
        setCategory({ slug: "", name: "", imageUrl: "", description: "", sortOrder: "0" });
    }

    async function saveProduct(product: AdminProduct) {
        if (!token) return;
        const draft = productDrafts[product.id];
        const price = Number(draft?.price); const stock = Number(draft?.stock);
        if (!Number.isInteger(price) || price < 1 || !Number.isInteger(stock) || stock < 0) {
            setNotice("দাম ও স্টক পূর্ণসংখ্যা হতে হবে; দাম ১ বা বেশি এবং স্টক ০ বা বেশি দিন."); return;
        }
        await mutate(`product-${product.id}`, () => updateAdminProduct(token, product.id, { price, stock, isActive: draft.isActive }), "পণ্য আপডেট হয়েছে।");
    }

    if (authStatus === "loading" || loading) return <p role="status" className={`${card} text-center text-muted-foreground`}>Admin panel লোড হচ্ছে…</p>;
    if (authStatus !== "authenticated" || !token) return <div className={`${card} text-center`}><p>Admin panel দেখতে লগইন করুন।</p><Link className={`${button} mt-4`} href="/login?next=%2Fadmin">লগইন</Link></div>;
    if (user?.role !== "ADMIN") return <div className={`${card} text-center`}><p className="font-semibold">এই প্যানেল শুধু admin ব্যবহার করতে পারেন।</p></div>;
    if (!data) return <div role="alert" className={`${card} text-center`}><p className="text-error">{error || "Admin data আনা যায়নি।"}</p><button className={`${button} mt-4`} onClick={() => void refresh()}>আবার চেষ্টা করুন</button></div>;

    const summary = [
        ["Seller applications", data.sellers.filter((seller) => seller.status === "PENDING").length],
        ["Users", data.users.length], ["Categories", data.categories.length],
        ["Products", data.products.length], ["Orders", data.orders.length],
    ] as const;

    return <div className="space-y-7">
        <section className={`${card} flex flex-wrap items-center justify-between gap-3`}><div><p className="text-sm text-muted-foreground">Administration</p><h2 className="mt-1 text-2xl font-bold">Admin Panel</h2></div><div className="flex gap-2"><Link className={button} href="/admin/delivery">ডেলিভারি ও Rider</Link><button className={button} onClick={() => void refresh()}>রিফ্রেশ</button></div></section>
        <section aria-label="Admin overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{summary.map(([label, value]) => <article key={label} className={card}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></article>)}</section>
        <nav aria-label="Admin panel sections" className="flex flex-wrap gap-2">{[["#sellers", "Sellers"], ["#users", "Users"], ["#categories", "Categories"], ["#products", "Products"], ["#orders", "Orders"]].map(([href, label]) => <a key={href} href={href} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary">{label}</a>)}</nav>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        {notice && <p role="status" className="text-sm font-medium text-primary">{notice}</p>}

        <section id="sellers" className="space-y-3 scroll-mt-28"><h2 className="text-xl font-bold">Seller approval</h2>
            {data.sellers.map((seller) => <article key={seller.id} className={`${card} flex flex-wrap items-center justify-between gap-4`}><div><p className="font-semibold">{seller.shopName}</p><p className="text-xs text-muted-foreground">{seller.slug} · seller #{seller.id} · user #{seller.userId}</p><p className="mt-1 text-sm">Status: {seller.status}</p></div><div className="flex flex-wrap gap-2">{(["APPROVED", "PENDING", "SUSPENDED"] as const).map((status) => <button key={status} disabled={busyKey === `seller-${seller.id}` || seller.status === status} onClick={() => token && void mutate(`seller-${seller.id}`, () => setSellerStatus(token, seller.id, status), `Seller status ${status} করা হয়েছে।`)} className={`${button} ${status === "SUSPENDED" ? "bg-error" : ""}`}>{status === "APPROVED" ? "অনুমোদন" : status === "SUSPENDED" ? "স্থগিত" : "Pending"}</button>)}</div></article>)}
            {data.sellers.length === 0 && <div className={card}><p className="text-sm text-muted-foreground">কোনো seller application নেই।</p></div>}
        </section>

        <section id="users" className="space-y-3 scroll-mt-28"><h2 className="text-xl font-bold">Users</h2><div className={`${card} overflow-x-auto`}><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-border text-muted-foreground"><th className="py-3 pr-3">নাম / ইমেইল</th><th className="py-3 pr-3">ফোন</th><th className="py-3 pr-3">Role</th><th className="py-3 pr-3">Status</th><th className="py-3">পরিবর্তন</th></tr></thead><tbody>{data.users.map((entry) => <tr key={entry.id} className="border-b border-border last:border-0"><td className="py-3 pr-3"><span className="block font-semibold">{entry.name}</span><span className="text-xs text-muted-foreground">{entry.email}</span></td><td className="py-3 pr-3">{entry.phone}</td><td className="py-3 pr-3">{entry.role}</td><td className="py-3 pr-3">{entry.status}</td><td className="py-3"><select aria-label={`${entry.name} status`} disabled={entry.role === "ADMIN" || entry.id === user.id || busyKey === `user-${entry.id}`} value={entry.status} onChange={(event) => token && void mutate(`user-${entry.id}`, () => setUserStatus(token, entry.id, event.target.value as "ACTIVE" | "INACTIVE" | "SUSPENDED"), "User status আপডেট হয়েছে।")} className={input}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="SUSPENDED">SUSPENDED</option></select></td></tr>)}</tbody></table></div>
        </section>

        <section id="categories" className="space-y-3 scroll-mt-28"><h2 className="text-xl font-bold">Categories</h2><form onSubmit={(event) => void addCategory(event)} className={`${card} grid gap-3 sm:grid-cols-2 xl:grid-cols-5`}><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={80} aria-label="Category slug" placeholder="slug" value={category.slug} onChange={(event) => setCategory((current) => ({ ...current, slug: event.target.value }))} className={input} /><input required minLength={2} maxLength={80} aria-label="Category name" placeholder="নাম" value={category.name} onChange={(event) => setCategory((current) => ({ ...current, name: event.target.value }))} className={input} /><input type="url" maxLength={500} aria-label="Image URL" placeholder="Image URL (optional)" value={category.imageUrl} onChange={(event) => setCategory((current) => ({ ...current, imageUrl: event.target.value }))} className={input} /><input type="number" min="0" max="100000" aria-label="Sort order" placeholder="Sort order" value={category.sortOrder} onChange={(event) => setCategory((current) => ({ ...current, sortOrder: event.target.value }))} className={input} /><button type="submit" disabled={busyKey === "category-new"} className={button}>ক্যাটাগরি যোগ</button></form><div className={`${card} divide-y divide-border`}>{data.categories.map((item) => { const draft = categoryDrafts[item.id] ?? { name: item.name, sortOrder: String(item.sortOrder) }; return <article key={item.id} className="grid gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_8rem_auto_auto] sm:items-center"><div><p className="text-xs text-muted-foreground">{item.slug}</p><input aria-label={`${item.slug} category name`} minLength={2} maxLength={80} value={draft.name} onChange={(event) => setCategoryDrafts((current) => ({ ...current, [item.id]: { ...draft, name: event.target.value } }))} className={`${input} mt-1 w-full`} /></div><label className="text-xs text-muted-foreground">Sort<input aria-label={`${item.slug} sort order`} type="number" min="0" max="100000" value={draft.sortOrder} onChange={(event) => setCategoryDrafts((current) => ({ ...current, [item.id]: { ...draft, sortOrder: event.target.value } }))} className={`${input} mt-1 w-full`} /></label><button className={button} disabled={busyKey === `category-edit-${item.id}`} onClick={() => { const sortOrder = Number(draft.sortOrder); if (!Number.isInteger(sortOrder) || sortOrder < 0) { setNotice("Sort order সঠিক পূর্ণসংখ্যা দিন।"); return; } if (token) void mutate(`category-edit-${item.id}`, () => saveCategory(token, { slug: item.slug, name: draft.name.trim(), imageUrl: item.imageUrl, description: item.description, parentId: item.parentId, sortOrder, isActive: item.isActive }, item.id), "ক্যাটাগরি আপডেট হয়েছে।"); }}>সেভ</button><button className={`${button} ${item.isActive ? "bg-muted text-foreground hover:bg-muted" : ""}`} disabled={busyKey === `category-${item.id}`} onClick={() => token && void mutate(`category-${item.id}`, () => saveCategory(token, { slug: item.slug, name: draft.name, imageUrl: item.imageUrl, description: item.description, parentId: item.parentId, sortOrder: Number(draft.sortOrder), isActive: !item.isActive }, item.id), item.isActive ? "ক্যাটাগরি নিষ্ক্রিয় হয়েছে।" : "ক্যাটাগরি সক্রিয় হয়েছে।")}>{item.isActive ? "নিষ্ক্রিয়" : "সক্রিয়"}</button></article>; })}</div></section>

        <section id="products" className="space-y-3 scroll-mt-28"><h2 className="text-xl font-bold">Products</h2><div className="space-y-3">{data.products.map((product) => { const draft = productDrafts[product.id] ?? { price: String(product.price), stock: String(product.stock), isActive: product.isActive }; return <article key={product.id} className={`${card} grid gap-3 md:grid-cols-[minmax(0,1fr)_7rem_7rem_auto_auto] md:items-center`}><div><p className="font-semibold">{product.name}</p><p className="text-xs text-muted-foreground">{product.slug} · seller {product.sellerId ?? "Amar Haat"}</p></div><label className="text-xs text-muted-foreground">দাম<input aria-label={`${product.name} price`} type="number" min="1" value={draft.price} onChange={(event) => setProductDrafts((current) => ({ ...current, [product.id]: { ...draft, price: event.target.value } }))} className={`${input} mt-1 w-full`} /></label><label className="text-xs text-muted-foreground">স্টক<input aria-label={`${product.name} stock`} type="number" min="0" value={draft.stock} onChange={(event) => setProductDrafts((current) => ({ ...current, [product.id]: { ...draft, stock: event.target.value } }))} className={`${input} mt-1 w-full`} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(event) => setProductDrafts((current) => ({ ...current, [product.id]: { ...draft, isActive: event.target.checked } }))} />সক্রিয়</label><button className={button} disabled={busyKey === `product-${product.id}`} onClick={() => void saveProduct(product)}>সেভ</button></article>; })}</div></section>

        <section id="orders" className="space-y-3 scroll-mt-28"><h2 className="text-xl font-bold">Orders</h2><div className={`${card} overflow-x-auto`}><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-border text-muted-foreground"><th className="py-3 pr-3">Order</th><th className="py-3 pr-3">Customer</th><th className="py-3 pr-3">Seller</th><th className="py-3 pr-3">Total</th><th className="py-3">Status</th></tr></thead><tbody>{data.orders.map((order) => <tr key={order.id} className="border-b border-border last:border-0"><td className="py-3 pr-3">{order.orderNumber}</td><td className="py-3 pr-3">{order.customerName}<span className="block text-xs text-muted-foreground">{order.customerPhone}</span></td><td className="py-3 pr-3">{order.sellerId ?? "Amar Haat"}</td><td className="py-3 pr-3">{money(order.total)}</td><td className="py-3"><select aria-label={`${order.orderNumber} status`} disabled={busyKey === `order-${order.id}`} value={order.status} onChange={(event) => token && void mutate(`order-${order.id}`, () => setOrderStatus(token, order.id, event.target.value), "Order status আপডেট হয়েছে।")} className={input}>{ORDER_STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div></section>
    </div>;
}
