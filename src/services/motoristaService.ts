import { apiFetch } from "./api";
import type { MinhaViagem } from "../types/minhaViagem";

export async function listarMinhasViagens(): Promise<MinhaViagem[]> {
    const resposta = await apiFetch("/api/motorista/minhas-viagens");

    if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);

        throw new Error(
            dados?.erro || "Não foi possível carregar suas viagens."
        );
    }

    return resposta.json();
}