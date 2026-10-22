import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../auth";
import type { RootState } from "../store";

// "loading" until the saved login (if any) has been checked in the browser.
// Pages wait for it, so a logged-in visitor never sees a "please log in" flash.
export type AuthStatus = "loading" | "guest" | "authenticated";

type AuthState = {
    status: AuthStatus;
    user: AuthUser | null;
    token: string | null;
};

const initialState: AuthState = {
    status: "loading",
    user: null,
    token: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        sessionStarted(
            state,
            action: PayloadAction<{ user: AuthUser; token: string }>,
        ) {
            state.status = "authenticated";
            state.user = action.payload.user;
            state.token = action.payload.token;
        },

        sessionEnded(state) {
            state.status = "guest";
            state.user = null;
            state.token = null;
        },

        userUpdated(state, action: PayloadAction<AuthUser>) {
            state.user = action.payload;
        },
    },
});

export const { sessionStarted, sessionEnded, userUpdated } = authSlice.actions;

export default authSlice.reducer;

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;