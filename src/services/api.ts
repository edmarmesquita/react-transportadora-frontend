const API_URL = "http://127.0.0.1:5000";

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = sessionStorage.getItem("accessToken");

    const headers = new Headers(options.headers);

    if (token) {
        headers.set(
            "Authorization",
            `Bearer ${token}`
        );
    }

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });
}