"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { selectAuthStatus, selectAuthToken, selectAuthUser } from "../../lib/features/authSlice";
import { useAppSelector } from "../../lib/hooks";
import { fetchRiderDashboard, setRiderAvailability, setRiderDeliveryStatus, type DeliveryOrder } from "../../lib/delivery";
const card = "rounded-2xl border border-border bg-card p-5";
const button = "inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50";
export default function RiderDashboardView() {
 const token=useAppSelector(selectAuthToken), auth=useAppSelector(selectAuthStatus), user=useAppSelector(selectAuthUser); const [orders,setOrders]=useState<DeliveryOrder[]>([]); const [available,setAvailable]=useState(false); const [notice,setNotice]=useState(""); const [busy,setBusy]=useState(false);
 const refresh=useCallback(async()=>{if(!token)return; const d=await fetchRiderDashboard(token); setOrders(d.deliveries); setAvailable(d.rider.isAvailable);},[token]);
 useEffect(()=>{if(auth==="authenticated"&&user?.role==="RIDER")void refresh().catch(e=>setNotice(e instanceof Error?e.message:"Rider dashboard লোড হয়নি"));},[auth,user?.role,refresh]);
 async function update(fn:()=>Promise<unknown>, message:string){setBusy(true);try{await fn();await refresh();setNotice(message);}catch(e){setNotice(e instanceof Error?e.message:"আপডেট করা যায়নি");}finally{setBusy(false);}}
 if(auth==="loading")return <p className={card}>লোড হচ্ছে…</p>; if(!token||user?.role!=="RIDER")return <div className={`${card} text-center`}>Rider dashboard দেখতে Rider account দিয়ে লগইন করুন।<Link className="ml-2 text-primary underline" href="/login?next=%2Frider%2Fdashboard">লগইন</Link></div>;
 const next:Record<string,string>={ASSIGNED:"ACCEPTED",ACCEPTED:"PICKED_UP",PICKED_UP:"DELIVERED"};
 return <div className="space-y-5"><section className={`${card} flex flex-wrap items-center justify-between gap-4`}><div><h2 className="text-xl font-bold">আমার ডেলিভারি</h2><p className="text-sm text-muted-foreground">শুধু আপনার নামে assign করা অর্ডার দেখা যাবে।</p></div><label className="flex items-center gap-2"><input type="checkbox" checked={available} disabled={busy} onChange={e=>void update(()=>setRiderAvailability(token,e.target.checked),e.target.checked?"আপনি available হয়েছেন।":"আপনি unavailable হয়েছেন।")}/>কাজের জন্য available</label></section>{notice&&<p role="status" className="text-sm text-primary">{notice}</p>}{orders.map(o=><article key={o.id} className={`${card} space-y-3`}><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{o.orderNumber}</h3><span className="rounded-full bg-muted px-3 py-1 text-xs">{o.status}</span></div><p>{o.customerName} · {o.customerPhone}</p><p className="text-sm">{o.address}, {o.union}, {o.upazila}</p><p className="text-sm">COD total: ৳{o.total}</p>{next[o.status]&&<button className={button} disabled={busy} onClick={()=>void update(()=>setRiderDeliveryStatus(token,o.id,next[o.status]!),`Delivery ${next[o.status]} হয়েছে।`)}>{next[o.status]==="ACCEPTED"?"অর্ডার গ্রহণ":next[o.status]==="PICKED_UP"?"পণ্য সংগ্রহ": "ডেলিভারি সম্পন্ন"}</button>}</article>)}{orders.length===0&&<p className={card}>এখনো কোনো delivery assign করা হয়নি।</p>}</div>;
}
