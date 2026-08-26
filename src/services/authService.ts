import { apiFetch } from "./api";
import type { LoginRequest, LoginResponse, UsuarioLogado } from "../types/auth";

type AlterarSenhaRequest = {
    senha_atual: string;
    nova_senha: string;
};

export async function alterarSenha(
    usuarioId: number,
    dados: AlterarSenhaRequest
): Promise<void> {
    const resposta = await apiFetch(
        `/api/usuarios/${usuarioId}/alterar-senha`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dados),
        }
    );

    if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);

        throw new Error(
            corpo?.erro || corpo?.msg || "Não foi possível alterar a senha."
        );
    }
}

export async function login(dados: LoginRequest): Promise<LoginResponse> {
    const resposta = await apiFetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
        const erro = await resposta.text();
        console.error("Erro no login:", resposta.status, erro);
        throw new Error("Usuário ou senha inválidos.");
    }

    return resposta.json();
}

export function salvarUsuarioLogado(usuario: UsuarioLogado) {
    sessionStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuario)
    );
}

export function buscarUsuarioLogado(): UsuarioLogado | null {
    const dados = sessionStorage.getItem("usuarioLogado");

    if (!dados) return null;

    try {
        return JSON.parse(dados) as UsuarioLogado;
    } catch {
        sessionStorage.removeItem("usuarioLogado");
        return null;
    }
}

export function salvarToken(token: string) {
    sessionStorage.setItem("accessToken", token);
}

export function buscarToken(): string | null {
    return sessionStorage.getItem("accessToken");
}

export function logout() {
    sessionStorage.removeItem("usuarioLogado");
    sessionStorage.removeItem("accessToken");
}