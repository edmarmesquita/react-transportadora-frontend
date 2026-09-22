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

export const EVENTO_SESSAO_NAO_AUTORIZADA =
    "app:sessao-nao-autorizada";

async function sinalizarSessaoNaoAutorizada(
    endpoint: string,
    resposta: Response
) {
    if (
        resposta.status !== 401 ||
        endpoint === "/api/login" ||
        !endpoint.startsWith("/api/")
    ) {
        return;
    }

    const dados = await resposta.clone().json().catch(() => null);

    if (dados?.erro !== "Usuário não autorizado.") {
        return;
    }

    window.dispatchEvent(
        new CustomEvent(EVENTO_SESSAO_NAO_AUTORIZADA)
    );
}

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

    const resposta = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    await sinalizarSessaoNaoAutorizada(endpoint, resposta);

    return resposta;
}
