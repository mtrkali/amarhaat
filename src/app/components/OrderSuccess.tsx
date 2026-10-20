"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { loadLastOrder } from "../../lib/last-order";
import type { PlacedOrder } from "../../lib/orders";

export default function OrderSuccess() {
    // undefined = not read yet, null = no recent order in this browser tab.
    const [order, setOrder] = useState<PlacedOrder | null | undefined>(undefined);

    // Read in the browser after the first render, so the server and the browser match.
    useEffect(() => {
        setOrder(loadLastOrder());
    }, []);

    if (order === undefined) {
        return (
            <p
                role="status"
                className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground"
            >
                লোড হচ্ছে...
            </p>
        );
    }

    if (order === null) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
                <p className="text-lg font-semibold text-foreground">
                    দেখানোর মতো কোনো সাম্প্রতিক অর্ডার পাওয়া যায়নি
                </p>
                <p className="text-sm text-muted-foreground">
                    অর্ডার দেওয়ার পর এই পেজটি রিফ্রেশ করলে বা নতুন ট্যাবে খুললে তথ্য দেখা যায় না।
                </p>
                <Link
                    href="/products"
                    className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                    কেনাকাটা করুন
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div
                role="status"
                className="flex flex-col items-center gap-3 rounded-2xl border border-primary bg-surface-green p-8 text-center"
            >
                <CheckCircle2
                    aria-hidden="true"
                    className="size-14 text-primary"
                    strokeWidth={1.6}
                />
                <h2 className="text-xl font-bold text-foreground">
                    আপনার অর্ডার গ্রহণ করা হয়েছে
                </h2>
                <p className="text-sm text-muted-foreground">
                    অর্ডার নম্বর
                </p>
                <p className="text-2xl font-bold tracking-wide text-foreground">
                    {order.orderNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                    এই নম্বরটি লিখে রাখুন। ডেলিভারির আগে {order.customerPhone} নম্বরে যোগাযোগ করা হবে।
                </p>
            </div>

            <section
                aria-labelledby="success-items-heading"
                className="rounded-2xl border border-border bg-card p-5"
            >
                <h2
                    id="success-items-heading"
                    className="text-lg font-bold text-foreground"
                >
                    অর্ডারের বিবরণ
                </h2>

                <ul className="mt-4 divide-y divide-border">
                    {order.items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between gap-4 py-3 text-sm"
                        >
                            <span className="min-w-0 text-foreground">
                                {item.productName}
                                <span className="block text-muted-foreground">
                                    {item.quantity} × ৳{item.unitPrice}
                                </span>
                            </span>
                            <span className="font-semibold text-foreground">
                                ৳{item.lineTotal}
                            </span>
                        </li>
                    ))}
                </ul>

                <dl className="mt-2 space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">পণ্যের মূল্য</dt>
                        <dd className="font-medium text-foreground">৳{order.subtotal}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">ডেলিভারি চার্জ</dt>
                        <dd className="font-medium text-foreground">৳{order.deliveryFee}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">পেমেন্ট</dt>
                        <dd className="font-medium text-foreground">ক্যাশ অন ডেলিভারি</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                        <dt className="font-semibold text-foreground">মোট</dt>
                        <dd className="text-xl font-bold text-foreground">৳{order.total}</dd>
                    </div>
                </dl>
            </section>

            <section
                aria-labelledby="success-address-heading"
                className="rounded-2xl border border-border bg-card p-5 text-sm"
            >
                <h2
                    id="success-address-heading"
                    className="text-lg font-bold text-foreground"
                >
                    ডেলিভারির ঠিকানা
                </h2>
                <p className="mt-3 font-medium text-foreground">{order.customerName}</p>
                <p className="mt-1 text-muted-foreground">
                    {order.address}, {order.union}, {order.upazila}
                </p>
            </section>

            <div className="grid gap-3 sm:grid-cols-2">
                <Link
                    href="/orders"
                    className="flex h-12 w-full items-center justify-center rounded-full border border-primary text-base font-semibold text-primary transition-colors hover:bg-surface-green"
                >
                    অর্ডারের অবস্থা দেখুন
                </Link>

                <Link
                    href="/products"
                    className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                    আরও কেনাকাটা করুন
                </Link>
            </div>
        </div>
    );
}
