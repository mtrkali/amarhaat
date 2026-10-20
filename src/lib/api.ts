const API_URL = process.env.NEXT_PUBLIC_API_URL;

// An error from the backend (or from reaching it). The pages use `message` and `status`;
// the forms can also read `errors` (field by field) and `code`.
export class ApiError extends Error {
    status: number; // 0 means the server could not be reached at all
    code?: string;
    errors?: Record<string, string>;

    constructor(
        message: string,
        status: number,
        code?: string,
        errors?: Record<string, string>,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.errors = errors;
    }
}

type ErrorBody = {
    message?: string;
    code?: string;
    errors?: Record<string, string>;
};

export async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {
    if (!API_URL) {
        throw new ApiError("NEXT_PUBLIC_API_URL is not set", 0);
    }

    // Only requests that send a body get this header. Plain GET requests stay "simple"
    // for the browser, so they need no extra CORS pre-check.
    const hasBody = options?.body !== undefined && options?.body !== null;

    let response: Response;

    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...(hasBody ? { "Content-Type": "application/json" } : {}),
                ...options?.headers,
            },
        });
    } catch {
        throw new ApiError("Could not reach the server", 0);
    }

    let body: unknown = null;

    try {
        body = await response.json();
    } catch {
        // The response had no JSON body.
    }

    if (!response.ok) {
        const errorBody = (body ?? {}) as ErrorBody;

        throw new ApiError(
            errorBody.message ?? `API request failed: ${response.status}`,
            response.status,
            errorBody.code,
            errorBody.errors,
        );
    }

    return body as T;
}

export interface HealthResponse {
    success: boolean;
    message: string;
}

export function getHealth() {
    return apiFetch<HealthResponse>("/health");
}