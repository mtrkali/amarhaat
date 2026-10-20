import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProducts, type Product } from "../catalog";

export type CatalogStatus = "idle" | "loading" | "ready" | "error";

type CatalogState = {
    products: Product[];
    status: CatalogStatus;
};

const initialState: CatalogState = {
    products: [],
    status: "idle",
};

// Loads every product once. The cart looks up names, prices and stock here,
// so there is one single source of truth: the backend.
export const loadCatalog = createAsyncThunk("catalog/load", () => getProducts());

const catalogSlice = createSlice({
    name: "catalog",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadCatalog.pending, (state) => {
                // A refresh keeps showing the old products instead of a loading screen.
                state.status = state.products.length > 0 ? "ready" : "loading";
            })
            .addCase(loadCatalog.fulfilled, (state, action) => {
                state.products = action.payload;
                state.status = "ready";
            })
            .addCase(loadCatalog.rejected, (state) => {
                state.status = state.products.length > 0 ? "ready" : "error";
            });
    },
});

export default catalogSlice.reducer;