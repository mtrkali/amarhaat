"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { fetchMe, isSessionError } from "../../lib/auth";
import { clearToken, loadToken } from "../../lib/auth-storage";
import { loadCart, saveCart } from "../../lib/cart-storage";
import { sessionEnded, sessionStarted } from "../../lib/features/authSlice";
import { hydrateCart, pruneCart } from "../../lib/features/cartSlice";
import { loadCatalog } from "../../lib/features/catalogSlice";
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

        // 1b. Load the products from the backend. The cart needs them for names, prices and stock.
        //     When they arrive, remove saved cart items whose product no longer exists.
        store.dispatch(loadCatalog()).then((result) => {
            if (loadCatalog.fulfilled.match(result)) {
                store.dispatch(pruneCart(result.payload.map((product) => product.id)));
            }
        });

        // 1c. Check the saved login, if there is one. Until this finishes, the auth state is "loading".
        const token = loadToken();

        if (!token) {
            store.dispatch(sessionEnded());
        } else {
            fetchMe(token)
                .then((user) => store.dispatch(sessionStarted({ user, token })))
                .catch((error) => {
                    // Only a rejected token ends the login. If the server is just unreachable,
                    // the token stays saved, so the next page load can try again.
                    if (isSessionError(error)) clearToken();

                    store.dispatch(sessionEnded());
                });
        }

        // 2. From new on, save the cart every time the store changes.
        //    the return function stops listening when this component is unmounts.
        return store.subscribe(() => saveCart(store.getState().cart.items));
    }, []);
    return <Provider store={storeRef.current}>{children}</Provider>
}