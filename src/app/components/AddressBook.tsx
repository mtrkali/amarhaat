"use client";

import { useEffect, useState, type FormEvent } from "react";
import { deleteAddress, fetchSavedAddresses, saveAddress, setDefaultAddress, type SavedAddress, type SavedAddressInput } from "../../lib/auth";

const empty: SavedAddressInput = { label: "", name: "", phone: "", upazila: "", union: "", ward: null, address: "", note: "", isDefault: false };
const field = "h-11 w-full rounded-xl border border-border bg-input px-3 text-sm text-foreground";

export default function AddressBook({ token }: { token: string }) {
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [draft, setDraft] = useState<SavedAddressInput>(empty);
    const [editing, setEditing] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    async function refresh() { setAddresses(await fetchSavedAddresses(token)); }
    useEffect(() => { void refresh().catch(() => setMessage("ঠিকানা লোড করা যায়নি।")); }, [token]);
    async function submit(event: FormEvent) {
        event.preventDefault(); setBusy(true); setMessage("");
        try { await saveAddress(token, draft, editing ?? undefined); setDraft(empty); setEditing(null); await refresh(); setMessage("ঠিকানা সেভ হয়েছে।"); }
        catch { setMessage("ঠিকানা সেভ করা যায়নি। তথ্যগুলো দেখে আবার চেষ্টা করুন।"); }
        finally { setBusy(false); }
    }
    return <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold text-foreground">সেভ করা ঠিকানা</h2>
        <ul className="mt-3 space-y-3">{addresses.map((item) => <li key={item.id} className="rounded-xl border border-border p-3 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{item.label || "ঠিকানা"} {item.isDefault && <span className="text-primary">· ডিফল্ট</span>}</p><p>{item.name} · {item.phone}</p><p className="text-muted-foreground">{item.address}, {item.union}, {item.upazila}</p></div>
            <div className="flex gap-2"> <button className="text-primary" onClick={() => { setEditing(item.id); setDraft({ ...item }); }}>সম্পাদনা</button><button className="text-error" onClick={() => void deleteAddress(token, item.id).then(refresh).catch(() => setMessage("মুছতে ব্যর্থ হয়েছে।"))}>মুছুন</button></div></div>
            {!item.isDefault && <button className="mt-2 text-xs font-semibold text-primary" onClick={() => void setDefaultAddress(token, item.id).then(refresh)}>ডিফল্ট করুন</button>}
        </li>)}</ul>
        <form onSubmit={(e) => void submit(e)} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className={field} aria-label="ঠিকানার নাম" placeholder="নাম: বাসা / দোকান" value={draft.label ?? ""} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            <input className={field} required aria-label="গ্রাহকের নাম" placeholder="আপনার নাম" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <input className={field} required aria-label="মোবাইল" placeholder="01XXXXXXXXX" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            <input className={field} required aria-label="উপজেলা" placeholder="উপজেলা" value={draft.upazila} onChange={(e) => setDraft({ ...draft, upazila: e.target.value })} />
            <input className={field} required aria-label="ইউনিয়ন" placeholder="ইউনিয়ন / পৌরসভা" value={draft.union} onChange={(e) => setDraft({ ...draft, union: e.target.value })} />
            <input className={field} type="number" min="1" max="99" aria-label="ওয়ার্ড" placeholder="ওয়ার্ড (ঐচ্ছিক)" value={draft.ward ?? ""} onChange={(e) => setDraft({ ...draft, ward: e.target.value ? Number(e.target.value) : null })} />
            <input className={`${field} sm:col-span-2`} required aria-label="বিস্তারিত ঠিকানা" placeholder="বাড়ি, রাস্তা ও বিস্তারিত ঠিকানা" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isDefault} onChange={(e) => setDraft({ ...draft, isDefault: e.target.checked })} />ডিফল্ট ঠিকানা</label>
            <div className="flex gap-2"><button disabled={busy} className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">{editing ? "আপডেট" : "ঠিকানা যোগ করুন"}</button>{editing && <button type="button" className="text-sm" onClick={() => { setEditing(null); setDraft(empty); }}>বাতিল</button>}</div>
        </form>
        {message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}
    </section>;
}
