const apiUrlConfigurada = import.meta.env.VITE_API_URL?.trim();

function obterApiUrl(): string {
    if (apiUrlConfigurada) {
        return apiUrlConfigurada.replace(/\/+$/, "");
    }

    if (import.meta.env.DEV) {
        return "http://127.0.0.1:5000";
    }

    throw new Error("VITE_API_URL não configurada para produção.");
}

const API_URL = obterApiUrl();

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
