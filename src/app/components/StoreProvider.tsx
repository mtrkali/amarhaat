"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { loadCart, saveCart } from "../../lib/cart-storage";
import { hydrateCart } from "../../lib/features/cartSlice";
import { makeStore, type AppStore } from "../../lib/store";


export default function StoreProvider({ children }: { children: ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);

    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    useEffect(() => {
        const store = storeRef.current;
        if (!store) return;

        // 1. Load the save cart. This happens in the browser only, after the first render
        //    so the server and the browser start from the same empty cart.

        store.dispatch(hydrateCart(loadCart()));

        // 2. From new on, save the cart every time the store changes.
        //    the return function stops listening when this component is unmounts.
        return store.subscribe(() => saveCart(store.getState().cart.items));
    }, []);
    return <Provider store={storeRef.current}>{children}</Provider>
}
