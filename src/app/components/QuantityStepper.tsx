import { Minus, Plus } from "lucide-react";
import { MAX_QUANTITY } from "../../lib/features/cartSlice";

type QuantitySteppersProps = {
    value: number;
    onChange: (nextNumber: number) => void;
    // Used in the screen reader label , e.g. the product name.
    label?: string;
    // The most that can be chosen. Defaults to the cart limit; pass less when stock is low.
    max?: number;
}

export default function QuantityStepper({
    value,
    onChange,
    label,
    max = MAX_QUANTITY,
}: QuantitySteppersProps) {
    return (
        <div
            role="group"
            aria-label={label ? `${label}: পরিমাণ` : "পরিমাণ"}
            className="flex items-center rounded-full border border-border bg-card"
        >
            <button
                type="button"
                onClick={() => onChange(value - 1)}
                disabled={value <= 1}
                aria-label="পরিমাণ কমান"
                className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
                <Minus className="size-5" />
            </button>

            <span
                aria-live="polite"
                className="min-w-10 text-center text-base font-semibold text-foreground"
            >
                {value}
            </span>

            <button
                type="button"
                onClick={() => onChange(value + 1)}
                disabled={value >= max}
                aria-label="পরিমাণ বাড়ান"
                className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
                <Plus className="size-5" />
            </button>
        </div>
    )
}
