"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Check, XCircle } from "lucide-react";
import { normalizePhone } from "../../lib/checkout";
import { loadLastOrder } from "../../lib/last-order";
import { ORDER_STEPS, trackOrder, trackOrderWithToken, type PlacedOrder } from "../../lib/orders";

const inputClass =
    "h-12 w-full rounded-xl border border-border bg-input px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25";

function StatusSteps({ status }: { status: string }) {
    if (status === "CANCELLED") {
        return (
            <p
                role="status"
                className="flex items-center gap-2 rounded-xl border border-error bg-card p-4 text-sm font-semibold text-error"
            >
                <XCircle aria-hidden="true" className="size-5 shrink-0" />
                এই অর্ডারটি বাতিল করা হয়েছে।
            </p>
        );
    }

    const currentIndex = ORDER_STEPS.findIndex((step) => step.status === status);

    return (
        <ol className="grid grid-cols-4 gap-2" aria-label="অর্ডারের ধাপ">
            {ORDER_STEPS.map((step, index) => {
                const done = index <= currentIndex;
                const current = index === currentIndex;

                return (
                    <li
                        key={step.status}
                        aria-current={current ? "step" : undefined}
                        className="flex flex-col items-center gap-2 text-center"
                    >
                        <span
                            className={`flex size-9 items-center justify-center rounded-full text-sm font-bold ${done
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {done ? (
                                <Check aria-hidden="true" className="size-5" />
                            ) : (
                                index + 1
                            )}
                        </span>
                        <span
                            className={`text-xs leading-tight sm:text-sm ${current
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                                }`}
                        >
                            {step.label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

export default function OrderTracker() {
    const [orderNumber, setOrderNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [order, setOrder] = useState<PlacedOrder | null>(null);

    // If an order was just placed in this tab, fill in its number and phone.
    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("token");
        if (token) {
            setLoading(true);
            void trackOrderWithToken(token).then((result) => {
                setLoading(false);
                if (result.ok) setOrder(result.order);
                else setMessage(result.message);
            });
            return;
        }
        const last = loadLastOrder();

        if (last) {
            setOrderNumber(last.orderNumber);
            setPhone(last.customerPhone);
        }
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage(null);

        const number = orderNumber.trim().toUpperCase();
        const cleanPhone = normalizePhone(phone);

        if (!number || !cleanPhone) {
            setOrder(null);
            setMessage("অর্ডার নম্বর ও মোবাইল নম্বর দুটোই লিখুন।");
            return;
        }

        setLoading(true);

        const result = await trackOrder(number, cleanPhone);

        setLoading(false);

        if (!result.ok) {
            setOrder(null);
            setMessage(result.message);
            return;
        }

        setOrder(result.order);
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-4 rounded-2xl border border-border bg-card p-5"
            >
                <div>
                    <label
                        htmlFor="track-number"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        অর্ডার নম্বর
                    </label>
                    <input
                        id="track-number"
                        type="text"
                        autoComplete="off"
                        placeholder="AH-20261018-123456"
                        value={orderNumber}
                        onChange={(event) => setOrderNumber(event.target.value)}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label
                        htmlFor="track-phone"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        মোবাইল নম্বর
                    </label>
                    <input
                        id="track-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                        অর্ডার করার সময় যে নম্বর দিয়েছিলেন, সেটি লিখুন।
                    </p>
                </div>

                {message && (
                    <p role="alert" className="text-sm font-medium text-error">
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-70"
                >
                    {loading ? "খোঁজা হচ্ছে..." : "অর্ডারের অবস্থা দেখুন"}
                </button>
            </form>

            {order && (
                <section
                    aria-label="অর্ডারের তথ্য"
                    className="space-y-5 rounded-2xl border border-border bg-card p-5"
                >
                    <div>
                        <p className="text-sm text-muted-foreground">অর্ডার নম্বর</p>
                        <p className="text-xl font-bold tracking-wide text-foreground">
                            {order.orderNumber}
                        </p>
                    </div>

                    {order.orders && order.orders.length > 1 && (
                        <div className="rounded-xl border border-border p-4">
                            <p className="font-semibold text-foreground">বিক্রেতাভিত্তিক অর্ডার</p>
                            <ul className="mt-2 space-y-2 text-sm">
                                {order.orders.map((child) => (
                                    <li key={child.orderNumber} className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">{child.sellerName} · {child.orderNumber}</span>
                                        <span className="font-medium text-foreground">৳{child.total}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <StatusSteps status={order.status} />

                    <ul className="divide-y divide-border border-t border-border">
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

                    <dl className="space-y-2 border-t border-border pt-4 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">ডেলিভারি চার্জ</dt>
                            <dd className="font-medium text-foreground">
                                ৳{order.deliveryFee}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <dt className="font-semibold text-foreground">
                                মোট (ক্যাশ অন ডেলিভারি)
                            </dt>
                            <dd className="text-xl font-bold text-foreground">
                                ৳{order.total}
                            </dd>
                        </div>
                    </dl>

                    <p className="border-t border-border pt-4 text-sm text-muted-foreground">
                        ঠিকানা: {order.address}, {order.union}, {order.upazila}
                    </p>
                </section>
            )}

            <p className="text-center text-sm text-muted-foreground">
                সমস্যা হলে{" "}
                <Link
                    href="/help"
                    className="font-semibold text-primary hover:text-primary-hover"
                >
                    সাহায্য ও FAQ
                </Link>{" "}
                দেখুন।
            </p>
        </div>
    );
}
