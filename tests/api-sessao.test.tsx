import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    apiFetch,
    EVENTO_SESSAO_NAO_AUTORIZADA,
} from "../src/services/api";
import { login } from "../src/services/authService";

function resposta(dados: unknown, status: number) {
    return new Response(JSON.stringify(dados), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

beforeEach(() => {
    sessionStorage.setItem("accessToken", "token-sintetico");
});

afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe("contrato global de sessão", () => {
    it("sinaliza somente 401 de usuário não autorizado", async () => {
        const listener = vi.fn();
        window.addEventListener(EVENTO_SESSAO_NAO_AUTORIZADA, listener);
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => resposta({ erro: "Usuário não autorizado." }, 401))
        );

        await apiFetch("/api/usuarios/10");

        expect(listener).toHaveBeenCalledTimes(1);
        window.removeEventListener(EVENTO_SESSAO_NAO_AUTORIZADA, listener);
    });

    it("não transforma expiração de token em sessão inativa", async () => {
        const listener = vi.fn();
        window.addEventListener(EVENTO_SESSAO_NAO_AUTORIZADA, listener);
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => resposta({ erro: "Autenticação inválida." }, 401))
        );

        await apiFetch("/api/usuarios/10");

        expect(listener).not.toHaveBeenCalled();
        window.removeEventListener(EVENTO_SESSAO_NAO_AUTORIZADA, listener);
    });

    it("não transforma falta de permissão 403 em sessão inativa", async () => {
        const listener = vi.fn();
        window.addEventListener(EVENTO_SESSAO_NAO_AUTORIZADA, listener);
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => resposta({ erro: "Acesso negado." }, 403))
        );

        await apiFetch("/api/admin/usuarios");

        expect(listener).not.toHaveBeenCalled();
        window.removeEventListener(EVENTO_SESSAO_NAO_AUTORIZADA, listener);
    });

    it("mantém o login normal fora do tratamento de sessão protegida", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () =>
                resposta(
                    {
                        access_token: "token-de-teste",
                        usuario: { id: 10, perfil: "motorista" },
                    },
                    200
                )
            )
        );

        const dados = await login({
            usuario: "motorista-hml",
            senha: "senha-sintetica",
        });

        expect(dados.access_token).toBe("token-de-teste");
    });
});
