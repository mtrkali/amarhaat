"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { ApiError, apiFetch } from "../../lib/api";
import { selectAuthStatus, selectAuthToken } from "../../lib/features/authSlice";
import { useAppSelector } from "../../lib/hooks";

type Review = { id: number; rating: number; comment: string | null; reviewerName: string; createdAt: string };
type ReviewResponse = { success: boolean; summary: { rating: number; reviewCount: number }; data: Review[] };
export default function ProductReviews({ slug }: { slug: string }) {
    const status = useAppSelector(selectAuthStatus); const token = useAppSelector(selectAuthToken);
    const [reviews, setReviews] = useState<Review[]>([]); const [summary, setSummary] = useState({ rating: 0, reviewCount: 0 });
    const [rating, setRating] = useState(5); const [comment, setComment] = useState(""); const [message, setMessage] = useState("");
    const refresh = useCallback(async () => { const result = await apiFetch<ReviewResponse>(`/products/${encodeURIComponent(slug)}/reviews`, { cache: "no-store" }); setReviews(result.data); setSummary(result.summary); }, [slug]);
    useEffect(() => { void refresh().catch(() => setMessage("রিভিউ লোড করা যায়নি।")); }, [refresh]);
    async function submit(event: FormEvent) { event.preventDefault(); if (!token) return; setMessage("");
        try { await apiFetch(`/products/${encodeURIComponent(slug)}/reviews`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ rating, comment: comment.trim() || null }) }); setComment(""); setMessage("রিভিউ জমা হয়েছে।"); await refresh(); }
        catch (error) { setMessage(error instanceof ApiError && error.status === 403 ? "পণ্যটি ডেলিভারি পাওয়ার পর রিভিউ দিতে পারবেন।" : error instanceof ApiError && error.status === 409 ? "এই পণ্যে আপনার রিভিউ আগে থেকেই আছে।" : "রিভিউ জমা দেওয়া যায়নি।"); }
    }
    return <section id="reviews" className="mt-12 space-y-5" aria-labelledby="reviews-heading">
        <div><h2 id="reviews-heading" className="text-2xl font-bold">ক্রেতাদের রিভিউ</h2><p className="mt-1 text-sm text-muted-foreground">{summary.reviewCount ? `গড় রেটিং ${summary.rating.toFixed(1)} / 5 · ${summary.reviewCount}টি রিভিউ` : "এখনো কোনো রিভিউ নেই"}</p></div>
        {status === "authenticated" && token ? <form onSubmit={(e) => void submit(e)} className="space-y-3 rounded-2xl border border-border bg-card p-4"><label className="block text-sm font-medium">আপনার রেটিং<select className="ml-3 rounded-lg border border-border bg-input px-3 py-2" value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} তারা</option>)}</select></label><textarea maxLength={1000} className="min-h-24 w-full rounded-xl border border-border bg-input p-3 text-sm" placeholder="আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)" value={comment} onChange={(e) => setComment(e.target.value)} /><button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">রিভিউ জমা দিন</button></form> : <p className="text-sm text-muted-foreground"><Link className="font-semibold text-primary underline" href={`/login?next=${encodeURIComponent(`/products/${slug}#reviews`)}`}>লগইন করুন</Link> রিভিউ দিতে। ডেলিভারি পাওয়া ক্রেতারাই রিভিউ দিতে পারবেন।</p>}
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        <ul className="grid gap-3 sm:grid-cols-2">{reviews.map((review) => <li key={review.id} className="rounded-2xl border border-border bg-card p-4"><p className="flex items-center gap-1 text-amber-500"><Star aria-hidden="true" className="size-4 fill-current" />{review.rating}/5 <span className="ml-2 text-sm font-semibold text-foreground">{review.reviewerName}</span></p>{review.comment && <p className="mt-3 whitespace-pre-wrap text-sm">{review.comment}</p>}<time className="mt-3 block text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("bn-BD")}</time></li>)}</ul>
    </section>;
}
