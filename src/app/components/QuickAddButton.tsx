"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { addToCart } from "../../lib/features/cartSlice";
import { useAppDispatch } from "../../lib/hooks";

type QuickAddButtonProps = {
    productId: string;
    productName: string;
    soldOut?: boolean;
};
export default function QuickAddButton({
    productId,
    productName,
    soldOut = false,
}: QuickAddButtonProps) {
    const dispatch = useAppDispatch();
    const [added, setAdded] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // stop the time if the cart disappears before it finishes
    useEffect(() => {
        return () => {
            if (timer.current) clearTimeout(timer.current);
        }
    }, [])

    function handleAdd() {
        dispatch(addToCart({ productId, quantity: 1 }));
        setAdded(true);

        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1500)
    }
    if (soldOut) {
        return (
            <button
                type="button"
                disabled
                aria-label={`${productName}: স্টক শেষ`}
                className="mt-auto flex h-10 w-full items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground"
            >
                স্টক শেষ
            </button>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={handleAdd}
                aria-label={`${productName} কার্টে নিন`}
                className="mt-auto flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
                {added ? (
                    <>
                        <Check aria-hidden="true" className="size-4" />
                        যোগ হয়েছে
                    </>
                ) : (
                    "কার্ট নিন"
                )}
            </button>

            <span role="status" className="sr-only">
                {added ? `${productName} কার্টে যোগ হয়েছে` : ""}
            </span>
        </>
    )
}
