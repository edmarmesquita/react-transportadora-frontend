import type { Usuario } from "../types/usuario";
import { apiFetch } from "./api";

const API = "/api/admin/usuarios";

export async function listarUsuarios(): Promise<Usuario[]> {
    const resposta = await apiFetch(API);

    if (!resposta.ok) {
        const erro = await resposta.text();

        console.error(
            "Erro ao buscar usuários:",
            resposta.status,
            erro
        );

        throw new Error(`Erro ${resposta.status} ao buscar usuários`);
    }

    return resposta.json();
}

export async function inativarUsuarioService(id: number): Promise<void> {
    const resposta = await apiFetch(
        `${API}/${id}/inativar`,
        {
            method: "POST",
        }
    );

    if (!resposta.ok) {
        const erro = await resposta.text();
        console.error("Erro do backend:", resposta.status, erro);
        throw new Error("Erro ao inativar usuário");
    }
}

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
            corpo?.erro || "Não foi possível alterar a senha."
        );
    }
}