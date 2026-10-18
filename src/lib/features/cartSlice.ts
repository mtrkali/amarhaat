import {
    createSelector,
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";
import { products, type Product } from "../mock-data";
import type { RootState } from "../store";
import { ChartLine } from "lucide-react";

// The most of one product a customer can put in the cart.
//TODO: use the real stock level once the backend provides it.
export const MAX_QUANTITY = 20;

// The cart store only ids and quantities. Name and price are looked up the
// catalog. so there is a single source truth for product data.
export type CartItem = {
    productId: string;
    quantity: number;
}

type CartState = {
    items: CartItem[];
    // false until the saved cart has been read from localstorage in the browser.
    hydrated: boolean;
}

const initialState: CartState = {
    items: [],
    hydrated: false,
}

function clampQuantity(quantity: number) {
    return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        //Immer lets us write "mutating" code here, it produces a new state safely.
        hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
            state.hydrated = true
        },

        addToCart(
            state,
            action: PayloadAction<{ productId: string, quantity: number }>,
        ) {
            const { productId, quantity } = action.payload;
            const existing = state.items.find(
                (item) => item.productId === productId,
            );

            if (existing) {
                existing.quantity = clampQuantity(existing.quantity + quantity);
            } else {
                state.items.push({ productId, quantity: clampQuantity(quantity) });
            }
        },

        setQuantity(
            state,
            action: PayloadAction<{ productId: string, quantity: number }>,
        ) {
            const { productId, quantity } = action.payload;

            if (quantity < 1) {
                state.items = state.items.filter(
                    (item) => item.productId !== productId,
                )
                return;
            }

            const existing = state.items.find(
                (item) => item.productId === productId,
            );

            if (existing) {
                existing.quantity = clampQuantity(quantity);
            }
        },

        removeFromCart(state, action: PayloadAction<string>) {
            state.items = state.items.filter(
                (item) => item.productId !== action.payload,
            );
        },

        clearCart(state) {
            state.items = [];
        },
    },
});

export const { hydrateCart, addToCart, setQuantity, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;

// ----------Selector: read(and derive) data from the sate --------
const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartHydrated = (state: RootState) => state.cart.hydrated;

export type CartLine = {
    product: Product,
    quantity: number;
    lineTotal: number;
};

// createSelectors remembers its last result so component only re-render
// when the cart realy changes;

export const selectCartLines = createSelector(
    [selectCartItems],
    (items): CartLine[] =>
        items.flatMap((item): CartLine[] => {
            const product = products.find((p) => p.id === item.productId);

            if (!product) return [];

            return [
                {
                    product,
                    quantity: item.quantity,
                    lineTotal: product.price * item.quantity,
                },
            ];
        }),

);


export const selectCartCount = createSelector([selectCartLines], (lines) =>
    lines.reduce((sum, line) => sum + line.quantity, 0)
);

export const selectCartSubtotal = createSelector([selectCartLines], (lines) =>
    lines.reduce((sum, line) => sum + line.lineTotal, 0))