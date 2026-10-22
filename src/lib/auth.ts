// Login, sign up, profile and shop requests, plus the form rules for them.
// The rules match the backend, so most mistakes are caught before a request is sent.

import { ApiError, apiFetch } from "./api";
import { normalizePhone } from "./checkout";
import type { PlacedOrder } from "./orders";

// ---------- Shapes ----------

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
};

export type ShopStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export type Shop = {
    id: number;
    shopName: string;
    slug: string;
    status: ShopStatus;
};

type DataResponse<T> = { success: boolean; data: T };

// The backend also sends fields the site does not need, so keep only these.
function pickUser(user: AuthUser): AuthUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
    };
}

// ---------- Requests ----------

// Requests that need a login send the token in the Authorization header.
function withToken(
    token: string,
    options: Omit<RequestInit, "headers"> = {},
): RequestInit {
    return { cache: "no-store", ...options, headers: { Authorization: `Bearer ${token}` } };
}

export async function loginRequest(email: string, password: string) {
    const response = await apiFetch<
        DataResponse<{ user: AuthUser; accessToken: string }>
    >("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    return {
        user: pickUser(response.data.user),
        token: response.data.accessToken,
    };
}

export async function registerRequest(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
}) {
    await apiFetch("/users/register", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export async function fetchMe(token: string): Promise<AuthUser> {
    const response = await apiFetch<DataResponse<AuthUser>>(
        "/users/me",
        withToken(token),
    );

    return pickUser(response.data);
}

export async function updateProfile(
    token: string,
    changes: { name?: string; phone?: string },
): Promise<AuthUser> {
    const response = await apiFetch<DataResponse<AuthUser>>(
        "/users/me",
        withToken(token, { method: "PATCH", body: JSON.stringify(changes) }),
    );

    return pickUser(response.data);
}

// Returns null when the user has not applied for a shop yet.
export async function fetchMyShop(token: string): Promise<Shop | null> {
    try {
        const response = await apiFetch<DataResponse<Shop>>(
            "/sellers/me",
            withToken(token),
        );

        return response.data;
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return null;
        }

        throw error;
    }
}

export async function applyForShop(
    token: string,
    shopName: string,
): Promise<Shop> {
    const response = await apiFetch<DataResponse<Shop>>(
        "/sellers/apply",
        withToken(token, { method: "POST", body: JSON.stringify({ shopName }) }),
    );

    return response.data;
}

export async function fetchMyOrders(token: string): Promise<PlacedOrder[]> {
    const response = await apiFetch<DataResponse<PlacedOrder[]>>(
        "/orders/my",
        withToken(token),
    );

    return response.data;
}

// ---------- Error messages ----------

// True when the saved login is no longer accepted (expired token, or a blocked account).
export function isSessionError(error: unknown): boolean {
    return (
        error instanceof ApiError && (error.status === 401 || error.status === 403)
    );
}

export function describeError(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 0) {
            return "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট দেখে আবার চেষ্টা করুন।";
        }

        if (error.status === 429) {
            return "অল্প সময়ে অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
        }
    }

    return "কিছু একটা সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
}

export function loginErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 401) {
            return "ইমেইল বা পাসওয়ার্ড ঠিক নয়।";
        }

        if (error.status === 403) {
            return "আপনার অ্যাকাউন্টটি নিষ্ক্রিয় বা স্থগিত করা হয়েছে।";
        }
    }

    return describeError(error);
}

// ---------- Form rules ----------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^01[3-9]\d{8}$/;

function emailError(email: string): string | undefined {
    if (!email) return "ইমেইল লিখুন।";
    if (!EMAIL_PATTERN.test(email)) return "সঠিক ইমেইল দিন, যেমন name@example.com।";
}

function phoneError(phone: string): string | undefined {
    if (!phone) return "মোবাইল নম্বর লিখুন।";
    if (!PHONE_PATTERN.test(phone)) return "সঠিক মোবাইল নম্বর দিন, যেমন 01XXXXXXXXX।";
}

function nameError(name: string): string | undefined {
    if (!name) return "আপনার নাম লিখুন।";
    if (name.length < 2) return "নাম অন্তত ২ অক্ষরের হতে হবে।";
    if (name.length > 80) return "নাম ৮০ অক্ষরের বেশি হতে পারবে না।";
}

// The backend asks for at least 8 characters with an uppercase letter,
// a lowercase letter and a number.
function newPasswordError(password: string): string | undefined {
    if (!password) return "পাসওয়ার্ড লিখুন।";

    if (
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password)
    ) {
        return "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে, আর তাতে ইংরেজি বড় হাতের অক্ষর, ছোট হাতের অক্ষর ও একটি সংখ্যা থাকতে হবে।";
    }
}

function tidyName(name: string) {
    return name.trim().replace(/\s+/g, " ");
}

export type LoginErrors = { email?: string; password?: string };

export function validateLogin(
    rawEmail: string,
    password: string,
):
    | { ok: true; email: string; password: string }
    | { ok: false; errors: LoginErrors } {
    const email = rawEmail.trim();
    const errors: LoginErrors = {};

    errors.email = emailError(email);
    if (!password) errors.password = "পাসওয়ার্ড লিখুন।";

    if (errors.email || errors.password) {
        return { ok: false, errors };
    }

    return { ok: true, email, password };
}

export type SignupValues = {
    name: string;
    email: string;
    phone: string;
    password: string;
};

export type SignupErrors = Partial<Record<keyof SignupValues, string>>;

export const SIGNUP_FIELD_ORDER: (keyof SignupValues)[] = [
    "name",
    "email",
    "phone",
    "password",
];

export function validateSignup(
    values: SignupValues,
):
    | { ok: true; values: SignupValues }
    | { ok: false; errors: SignupErrors } {
    const cleaned: SignupValues = {
        name: tidyName(values.name),
        email: values.email.trim(),
        phone: normalizePhone(values.phone),
        password: values.password,
    };

    const errors: SignupErrors = {};
    const found: SignupErrors = {
        name: nameError(cleaned.name),
        email: emailError(cleaned.email),
        phone: phoneError(cleaned.phone),
        password: newPasswordError(cleaned.password),
    };

    for (const field of SIGNUP_FIELD_ORDER) {
        const message = found[field];
        if (message) errors[field] = message;
    }

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
    }

    return { ok: true, values: cleaned };
}

export type ProfileErrors = { name?: string; phone?: string };

export function validateProfile(
    values: { name: string; phone: string },
):
    | { ok: true; values: { name: string; phone: string } }
    | { ok: false; errors: ProfileErrors } {
    const cleaned = {
        name: tidyName(values.name),
        phone: normalizePhone(values.phone),
    };

    const errors: ProfileErrors = {};
    const name = nameError(cleaned.name);
    const phone = phoneError(cleaned.phone);

    if (name) errors.name = name;
    if (phone) errors.phone = phone;

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
    }

    return { ok: true, values: cleaned };
}

export function validateShopName(
    raw: string,
): { ok: true; shopName: string } | { ok: false; error: string } {
    const shopName = tidyName(raw);

    if (!shopName) return { ok: false, error: "দোকানের নাম লিখুন।" };
    if (shopName.length < 2) return { ok: false, error: "দোকানের নাম অন্তত ২ অক্ষরের হতে হবে।" };
    if (shopName.length > 60) return { ok: false, error: "দোকানের নাম ৬০ অক্ষরের বেশি হতে পারবে না।" };

    return { ok: true, shopName };
}

// ---------- Redirect after login ----------

// "?next=/profile" says where to go after login. Only paths on this site are allowed,
// so nobody can build a link that sends a visitor to another website after login.
export function safeRedirectPath(
    raw: string | string[] | undefined,
    fallback = "/",
): string {
    const value = Array.isArray(raw) ? raw[0] : raw;

    if (
        !value ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.includes("\\")
    ) {
        return fallback;
    }

    return value;
}