"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { addToCart, MAX_QUANTITY } from "../../lib/features/cartSlice";
import { useAppDispatch } from "../../lib/hooks";
import QuantityStepper from "./QuantityStepper";

type AddToCartProps = {
    productId: string;
    productName: string;
    unitPrice: number;
};

export default function AddToCart({
    productId,
    productName,
    unitPrice }: AddToCartProps) {
    const dispatch = useAppDispatch();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    function changeQuantity(next: number) {
        setQuantity(Math.min(MAX_QUANTITY, Math.max(1, next)));
        setAdded(false);
    }

    function handleAdd() {
        dispatch(addToCart({ productId, quantity }))
        setAdded(false);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <QuantityStepper
                    value={quantity}
                    onChange={changeQuantity}
                    label={productName}
                />

                <p className="text-right text-sm text-muted-foreground">
                    মোট
                    <span className="block text-xl font-bold text-foreground">
                        ৳{quantity * unitPrice}
                    </span>
                </p>
            </div>

            <button
                type="button"
                onClick={handleAdd}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
                <ShoppingCart className="size-5" />
                কার্টে নিন
            </button>

            <p role="status" className="min-h-5 text-sm text-muted-foreground">
                {added && (
                    <>
                        {productName} কার্টে যোগ হয়েছে।{" "}
                        <Link
                            href="/cart"
                            className="font-semibold text-primary hover:text-primary-hover"
                        >
                            কার্ট দেখুন
                        </Link>
                    </>
                )}
            </p>
        </div>

    );
}