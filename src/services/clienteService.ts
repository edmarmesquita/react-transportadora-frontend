import { apiFetch } from "./api";
import type {
    MinhaCarga,
    DetalheMinhaCarga,
    OcorrenciaCarga,
    NovaOcorrenciaCarga,
    ComprovantesCargaResponse,
} from "../types/minhaCarga";

export async function listarMinhasCargas(): Promise<MinhaCarga[]> {
    const resposta = await apiFetch("/api/cliente/minhas-cargas");

    if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);

        throw new Error(
            dados?.erro || dados?.msg || "Não foi possível carregar suas cargas."
        );
    }

    return resposta.json();
}

export async function buscarDetalheCarga(
    cargaId: number
): Promise<DetalheMinhaCarga> {
    try {
        const resposta = await apiFetch(
            `/api/cliente/minhas-cargas/${cargaId}`
        );

        const texto = await resposta.text();

        console.log("STATUS DETALHE:", resposta.status);
        console.log("RESPOSTA DETALHE:", texto);

        if (!resposta.ok) {
            let mensagem = `Erro ${resposta.status} ao carregar a carga.`;

            try {
                const dados = JSON.parse(texto);
                mensagem = dados.erro || dados.msg || mensagem;
            } catch {
                // Mantém a mensagem padrão
            }

            throw new Error(mensagem);
        }

        return JSON.parse(texto);
    } catch (error) {
        console.error("ERRO COMPLETO DETALHE:", error);
        throw error;
    }
}

export async function listarOcorrenciasCarga(
    cargaId: number
): Promise<OcorrenciaCarga[]> {
    const resposta = await apiFetch(
        `/api/cliente/minhas-cargas/${cargaId}/ocorrencias`
    );

    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        throw new Error(
            dados?.erro ||
            dados?.msg ||
            "Não foi possível carregar as ocorrências."
        );
    }

    return dados;
}

export async function criarOcorrenciaCarga(
    cargaId: number,
    ocorrencia: NovaOcorrenciaCarga
): Promise<OcorrenciaCarga> {
    const resposta = await apiFetch(
        `/api/cliente/minhas-cargas/${cargaId}/ocorrencias`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ocorrencia),
        }
    );

    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        throw new Error(
            dados?.erro ||
            dados?.msg ||
            "Não foi possível registrar a ocorrência."
        );
    }

    return dados.ocorrencia;
}

export async function listarComprovantesCarga(
    cargaId: number
): Promise<ComprovantesCargaResponse> {
    const resposta = await apiFetch(
        `/api/cliente/minhas-cargas/${cargaId}/comprovantes`
    );

    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        throw new Error(
            dados?.erro ||
            dados?.msg ||
            "Não foi possível carregar os comprovantes."
        );
    }

    return dados;
}

export type PerfilCliente = {
    nome: string;
    empresa: string;
    nome_fantasia: string;
    responsavel: string;
    email: string;
    telefone: string;
    documento: string;
    endereco: string;
    cidade: string;
    estado: string;
};

export async function buscarPerfilCliente(): Promise<PerfilCliente> {
    const resposta = await apiFetch(
        "/api/cliente/perfil"
    );

    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        throw new Error(
            dados?.erro ||
            dados?.msg ||
            "Não foi possível carregar o perfil."
        );
    }

    return dados;
}
