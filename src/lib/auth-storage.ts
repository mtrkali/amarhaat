// Keeps the login token in the browser, so a visitor stays logged in after a refresh.
// Anything saved in the browser can be read by scripts on the page, so this site must
// never run code from other sources. A login cookie set by the backend would be stronger,
// but it needs backend changes, so this is the simple version.
const STORAGE_KEY = "amar-haat-token";

export function loadToken(): string | null {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export function saveToken(token: string) {
    try {
        window.localStorage.setItem(STORAGE_KEY, token);
    } catch {
        // Storage can be blocked. The login still works until the page is closed.
    }
}

export function clearToken() {
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Nothing to do.
    }
}