import {
    createSelector,
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";
import type { Product } from "../catalog";
import type { RootState } from "../store";

// The most of one product a customer can put in the cart.
// The real stock level (from the backend) can lower this further for each product.
export const MAX_QUANTITY = 20;

// The cart stores only ids (the product slug) and quantities. Name, price and stock are
// looked up in the catalog (loaded from the backend), so there is one source of truth.
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

        // Drops cart items whose product no longer exists in the catalog
        // (for example a product that was hidden after the customer saved the cart).
        pruneCart(state, action: PayloadAction<string[]>) {
            const validIds = new Set(action.payload);

            state.items = state.items.filter((item) =>
                validIds.has(item.productId),
            );
        },
    },
});

export const {
    hydrateCart,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    pruneCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// ----------Selector: read(and derive) data from the sate --------
const selectCartItems = (state: RootState) => state.cart.items;
const selectCatalogProducts = (state: RootState) => state.catalog.products;
export const selectCartHydrated = (state: RootState) => state.cart.hydrated;

export type CartLine = {
    product: Product;
    quantity: number;
    // false when the product is out of stock. Such a line is shown but not counted or ordered.
    available: boolean;
    lineTotal: number;
};

// createSelectors remembers its last result so component only re-render
// when the cart realy changes;

export const selectCartLines = createSelector(
    [selectCartItems, selectCatalogProducts],
    (items, catalog): CartLine[] =>
        items.flatMap((item): CartLine[] => {
            const product = catalog.find((p) => p.id === item.productId);

            if (!product) return [];

            const available = product.stock > 0;

            // Never show more than what is in stock.
            const quantity = available
                ? Math.min(item.quantity, product.stock)
                : item.quantity;

            return [
                {
                    product,
                    quantity,
                    available,
                    lineTotal: available ? product.price * quantity : 0,
                },
            ];
        }),
);

// The badge in the header. It counts what is saved in the cart, so it shows at once,
// even before the catalog has finished loading.
export const selectCartCount = createSelector([selectCartItems], (items) =>
    items.reduce((sum, item) => sum + item.quantity, 0),
);

// What the customer will actually be ordering (in-stock lines only).
export const selectAvailableCount = createSelector([selectCartLines], (lines) =>
    lines.reduce((sum, line) => sum + (line.available ? line.quantity : 0), 0),
);

export const selectCartSubtotal = createSelector([selectCartLines], (lines) =>
    lines.reduce((sum, line) => sum + line.lineTotal, 0),
);