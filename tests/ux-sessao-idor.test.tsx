import type { ReactNode } from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import { NotificationProvider } from "../src/components/ui/NotificationProvider";
import SessaoGuard from "../src/components/auth/SessaoGuard";
import DetalheViagem from "../src/pages/DetalheViagem";
import { EVENTO_SESSAO_NAO_AUTORIZADA } from "../src/services/api";
import { apiFetch } from "../src/services/api";

vi.mock("../src/services/api", async () => {
    const modulo = await vi.importActual<typeof import("../src/services/api")>(
        "../src/services/api"
    );

    return {
        ...modulo,
        apiFetch: vi.fn(),
    };
});

vi.mock("../src/components/admin/AdminLayout", () => ({
    default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

vi.mock("../src/components/admin/RastreamentoViagem", () => ({
    default: () => null,
}));

const api = vi.mocked(apiFetch);

function resposta(dados: unknown, status = 200) {
    return new Response(JSON.stringify(dados), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function Localizacao() {
    return <output data-testid="rota">{useLocation().pathname}</output>;
}

function montarDetalhe(caminho: string) {
    return render(
        <NotificationProvider>
            <MemoryRouter initialEntries={[caminho]}>
                <Routes>
                    <Route
                        path="/portal/motorista/minhas-viagens/:id"
                        element={<DetalheViagem />}
                    />
                </Routes>
            </MemoryRouter>
        </NotificationProvider>
    );
}

function montarGuard(caminho: string) {
    return render(
        <NotificationProvider>
            <MemoryRouter initialEntries={[caminho]}>
                <SessaoGuard />
                <Localizacao />
                <Routes>
                    <Route path="*" element={<div>Página protegida</div>} />
                </Routes>
            </MemoryRouter>
        </NotificationProvider>
    );
}

beforeEach(() => {
    sessionStorage.setItem("accessToken", "token-sintetico");
    sessionStorage.setItem(
        "usuarioLogado",
        JSON.stringify({ id: 10, perfil: "motorista", ativo: true })
    );
    api.mockImplementation(async (endpoint) => {
        if (endpoint.endsWith("/historico")) return resposta([]);
        if (endpoint.endsWith("/comprovante")) return resposta({});
        if (endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
        return resposta({
            id: 7,
            codigo_carga: "HML-VIAGEM-PRÓPRIA",
            cliente: "Cliente HML",
            motorista: "Motorista HML",
            veiculo: "HML1A23",
            origem: "Origem HML",
            destino: "Destino HML",
            status: "Programada",
            data_criacao: "21/09/2026 12:00",
        });
    });
});

afterEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.restoreAllMocks();
});

describe("detalhe de viagem do motorista", () => {
    it("carrega a viagem própria normalmente", async () => {
        montarDetalhe("/portal/motorista/minhas-viagens/7");

        expect(
            (await screen.findAllByText("HML-VIAGEM-PRÓPRIA")).length
        ).toBeGreaterThan(0);
        expect(screen.queryByText("Viagem não encontrada")).toBeNull();
    });

    it("mostra erro claro sem expor dados de viagem alheia", async () => {
        api.mockImplementation(async (endpoint) => {
            if (endpoint.endsWith("/minhas-viagens/99")) {
                return resposta(
                    {
                        erro: "Viagem não encontrada ou não pertence a este motorista.",
                    },
                    404
                );
            }

            return resposta([], 404);
        });

        montarDetalhe("/portal/motorista/minhas-viagens/99");

        expect(
            await screen.findByText(
                "Viagem não encontrada ou não pertence a este motorista."
            )
        ).toBeTruthy();
        expect(screen.queryByText("Carga alheia HML")).toBeNull();
        expect(screen.getByRole("alert")).toBeTruthy();
    });

    it("não deixa a área principal vazia quando a resposta não tem dados", async () => {
        api.mockImplementation(async (endpoint) => {
            if (endpoint.endsWith("/minhas-viagens/7")) {
                return resposta({});
            }

            return resposta([]);
        });

        montarDetalhe("/portal/motorista/minhas-viagens/7");

        expect(
            await screen.findByText("Viagem não encontrada")
        ).toBeTruthy();
        expect(screen.getByRole("alert")).toBeTruthy();
    });
});

describe("sessão não autorizada", () => {
    it("limpa a sessão, redireciona ao login e mostra toast sem loop", async () => {
        montarGuard("/portal/motorista");

        act(() => {
            window.dispatchEvent(
                new CustomEvent(EVENTO_SESSAO_NAO_AUTORIZADA)
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId("rota").textContent).toBe("/admin/login");
        });

        expect(sessionStorage.getItem("accessToken")).toBeNull();
        expect(sessionStorage.getItem("usuarioLogado")).toBeNull();
        expect(
            screen.getByText(
                "Seu usuário está inativo. Entre em contato com o administrador."
            )
        ).toBeTruthy();

        act(() => {
            window.dispatchEvent(
                new CustomEvent(EVENTO_SESSAO_NAO_AUTORIZADA)
            );
        });

        expect(screen.getByTestId("rota").textContent).toBe("/admin/login");
    });

    it("não encerra uma sessão ao receber o evento já estando no login", () => {
        montarGuard("/admin/login");

        act(() => {
            window.dispatchEvent(
                new CustomEvent(EVENTO_SESSAO_NAO_AUTORIZADA)
            );
        });

        expect(screen.getByTestId("rota").textContent).toBe("/admin/login");
        expect(sessionStorage.getItem("accessToken")).toBe("token-sintetico");
    });
});
