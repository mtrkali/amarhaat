"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

type AddToCartProps = {
    productName: string;
    unitPrice: number;
};

// TODO: use the real stock level once the backend provides it.
const MAX_QUANTITY = 20;

export default function AddToCart({ productName, unitPrice }: AddToCartProps) {
    const [quantity, setQuantity] = useState(1);
    const [showNotice, setShowNotice] = useState(false);

    function changeQuantity(next: number) {
        setQuantity(Math.min(MAX_QUANTITY, Math.max(1, next)));
        setShowNotice(false);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div
                    role="group"
                    aria-label="পরিমাণ"
                    className="flex items-center rounded-full border border-border bg-card"
                >
                    <button
                        type="button"
                        onClick={() => changeQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                        aria-label="পরিমাণ কমান"
                        className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                    >
                        <Minus className="size-5" />
                    </button>

                    <span
                        aria-live="polite"
                        className="min-w-10 text-center text-base font-semibold text-foreground"
                    >
                        {quantity}
                    </span>

                    <button
                        type="button"
                        onClick={() => changeQuantity(quantity + 1)}
                        disabled={quantity >= MAX_QUANTITY}
                        aria-label="পরিমাণ বাড়ান"
                        className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                    >
                        <Plus className="size-5" />
                    </button>
                </div>

                <p className="text-right text-sm text-muted-foreground">
                    মোট
                    <span className="block text-xl font-bold text-foreground">
                        ৳{quantity * unitPrice}
                    </span>
                </p>
            </div>

            {/* TODO: add the item to the cart once cart state exists. */}
            <button
                type="button"
                onClick={() => setShowNotice(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
                <ShoppingCart className="size-5" />
                কার্টে নিন
            </button>

            <p role="status" className="min-h-5 text-sm text-muted-foreground">
                {showNotice
                    ? `${productName}: কার্টের সুবিধা এখনো চালু হয়নি।`
                    : ""}
            </p>
        </div>
    );
}