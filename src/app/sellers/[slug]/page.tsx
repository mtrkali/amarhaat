import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import { getProduct, type Product } from "../../../lib/catalog";
import AddToCart from "../../components/AddToCart";
import PageHeading from "../../components/PageHeading";

type ShopData = { id: number; slug: string; shopName: string; imageUrl: string | null; products: { slug: string; name: string; price: number; stock: number; imageUrl: string | null; description: string | null }[] };
type Props = { params: Promise<{ slug: string }> };
async function getShop(slug: string) { return (await apiFetch<{ data: ShopData }>(`/sellers/public/${encodeURIComponent(slug)}`, { cache: "no-store" })).data; }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; try { const shop = await getShop(slug); return { title: `${shop.shopName} | Amar Haat`, description: `${shop.shopName} এর পণ্য দেখুন ও অর্ডার করুন।` }; } catch { return { title: "দোকান | Amar Haat" }; } }
export default async function PublicSellerPage({ params }: Props) {
    const { slug } = await params; let shop: ShopData;
    try { shop = await getShop(slug); } catch { notFound(); }
    const products = await Promise.all(shop.products.map((item) => getProduct(item.slug).catch(() => null)));
    return <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8"><PageHeading crumbs={[{ label: "হোম", href: "/" }, { label: "দোকান" }]} title={shop.shopName} description="এই বিক্রেতার পণ্য" />
        {products.filter((p): p is Product => p !== null).length === 0 ? <p className="rounded-2xl border border-border p-8 text-center text-muted-foreground">এই দোকানে এখনো কোনো পণ্য নেই।</p> : <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => product && <li key={product.id} className="overflow-hidden rounded-2xl border border-border bg-card"><Link href={product.href} className="block"><div className="relative aspect-[4/3] bg-muted">{product.image ? <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : <span className="flex size-full items-center justify-center text-6xl">{product.emoji}</span>}</div><div className="p-4"><h2 className="font-semibold">{product.name}</h2><p className="mt-1 text-lg font-bold">৳{product.price}</p><p className="text-xs text-muted-foreground">স্টক: {product.stock}</p></div></Link><div className="px-4 pb-4"><AddToCart productId={product.id} productName={product.name} unitPrice={product.price} stock={product.stock} /></div></li>)}</ul>}
    </main>;
}
