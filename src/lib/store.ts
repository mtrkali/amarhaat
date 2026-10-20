import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";
import catalogReducer from "./features/catalogSlice";

// In the Next.js app router the store is created per request/browser session
// though a function , so data is neve shared between different visitor on the server.

export const makeStore = () =>
    configureStore({
        reducer: {
            cart: cartReducer,
            catalog: catalogReducer,
        },
    });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];