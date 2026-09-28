const API_URL = process.env.NEXT_PUBLIC_API_URL;


export async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}

export interface HealthResponse {
    success: boolean;
    message: string;
}

export function getHealth() {
    return apiFetch<HealthResponse>("/health");
}