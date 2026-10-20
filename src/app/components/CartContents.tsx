"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import {
    MAX_QUANTITY,
    clearCart,
    removeFromCart,
    selectAvailableCount,
    selectCartCount,
    selectCartHydrated,
    selectCartLines,
    selectCartSubtotal,
    setQuantity,
} from "../../lib/features/cartSlice";
import { loadCatalog } from "../../lib/features/catalogSlice";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import QuantityStepper from "./QuantityStepper";

function EmptyCart() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
            <ShoppingBag
                aria-hidden="true"
                className="size-14 text-muted-foreground"
                strokeWidth={1.4}
            />

            <div>
                <p className="text-lg font-semibold text-foreground">
                    আপনার কার্ট খালি
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    পছন্দের পণ্য কার্টে যোগ করুন।
                </p>
            </div>

            <Link
                href="/products"
                className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
                কেনাকাটা শুরু করুন
            </Link>
        </div>
    );
}

export default function CartContents() {
    const dispatch = useAppDispatch();
    const hydrated = useAppSelector(selectCartHydrated);
    const lines = useAppSelector(selectCartLines);
    const savedCount = useAppSelector(selectCartCount);
    const count = useAppSelector(selectAvailableCount);
    const subtotal = useAppSelector(selectCartSubtotal);
    const catalogStatus = useAppSelector((state) => state.catalog.status);

    // The save cart read in the browser. after the first render.
    // without this check, a full cart would flash as "empty" for a moment.

    if (!hydrated) {
        return (
            <p
                role="status"
                className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground"
            >
                কার্ট লোড হচ্ছে...
            </p>
        );
    }

    // Nothing saved in the cart: no need to wait for the products to load.
    if (savedCount === 0) {
        return <EmptyCart />;
    }

    // The cart holds only ids. Names, prices and stock come from the backend.
    if (catalogStatus === "idle" || catalogStatus === "loading") {
        return (
            <p
                role="status"
                className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground"
            >
                পণ্যের তথ্য লোড হচ্ছে...
            </p>
        );
    }

    if (catalogStatus === "error") {
        return (
            <div
                role="alert"
                className="rounded-2xl border border-border bg-card p-8 text-center"
            >
                <p className="text-lg font-semibold text-foreground">
                    পণ্যের তথ্য লোড করা যায়নি
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    ইন্টারনেট দেখে আবার চেষ্টা করুন। আপনার কার্ট ঠিকই আছে।
                </p>
                <button
                    type="button"
                    onClick={() => dispatch(loadCatalog())}
                    className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                    আবার চেষ্টা করুন
                </button>
            </div>
        );
    }

    if (lines.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <section aria-label="কার্টের পণ্য">
                <ul className="space-y-3">
                    {lines.map(({ product, quantity, available, lineTotal }) => (
                        <li
                            key={product.id}
                            className="flex gap-3 rounded-2xl border border-border bg-card p-3 sm:gap-4 sm:p-4"
                        >
                            <Link
                                href={product.href}
                                tabIndex={-1}
                                aria-hidden="true"
                                className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24"
                            >
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt=""
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="flex size-full items-center justify-center text-4xl">
                                        {product.emoji}
                                    </span>
                                )}
                            </Link>

                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h2 className="text-sm font-medium leading-snug text-foreground sm:text-base">
                                        <Link
                                            href={product.href}
                                            className="hover:text-primary"
                                        >
                                            {product.name}
                                        </Link>
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            dispatch(removeFromCart(product.id))
                                        }
                                        aria-label={`${product.name} কার্ট থেকে সরান`}
                                        className="-mr-2 -mt-2 flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-error"
                                    >
                                        <Trash2 className="size-5" />
                                    </button>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    প্রতিটি ৳{product.price}
                                </p>

                                {available ? (
                                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                                        <QuantityStepper
                                            value={quantity}
                                            label={product.name}
                                            max={Math.min(MAX_QUANTITY, product.stock)}
                                            onChange={(next) =>
                                                dispatch(
                                                    setQuantity({
                                                        productId: product.id,
                                                        quantity: next,
                                                    }),
                                                )
                                            }
                                        />

                                        <p className="text-lg font-bold text-foreground">
                                            ৳{lineTotal}
                                        </p>
                                    </div>
                                ) : (
                                    <p
                                        role="status"
                                        className="mt-auto text-sm font-semibold text-error"
                                    >
                                        স্টক শেষ। অর্ডারে এটি যুক্ত হবে না, কার্ট থেকে সরিয়ে দিন।
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                <button
                    type="button"
                    onClick={() => dispatch(clearCart())}
                    className="mt-4 text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-error"
                >
                    কার্ট খালি করুন
                </button>
            </section>

            <aside
                aria-labelledby="summary-heading"
                className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28"
            >
                <h2
                    id="summary-heading"
                    className="text-lg font-bold text-foreground"
                >
                    অর্ডারের সারসংক্ষেপ
                </h2>

                <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">পণ্য ({count}টি)</dt>
                        <dd className="font-medium text-foreground">
                            ৳{subtotal}
                        </dd>
                    </div>
                </dl>

                {/* TODO: add the delivery fee here once the delivery rules are decided. */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-semibold text-foreground">
                        সাবটোটাল
                    </span>
                    <span className="text-xl font-bold text-foreground">
                        ৳{subtotal}
                    </span>
                </div>

                {count > 0 ? (
                    <Link
                        href="/checkout"
                        className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                        অর্ডার করতে এগিয়ে যান
                    </Link>
                ) : (
                    <p className="mt-5 text-center text-sm text-muted-foreground">
                        অর্ডার করার মতো স্টকে থাকা পণ্য নেই।
                    </p>
                )}

                <p className="mt-3 text-center text-xs text-muted-foreground">
                    ক্যাশ অন ডেলিভারি (COD) সুবিধা আছে।
                </p>
            </aside>
        </div>
    );
}
