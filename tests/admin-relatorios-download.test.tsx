import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationProvider } from "../src/components/ui/NotificationProvider";
import { apiFetch } from "../src/services/api";
import AdminRelatorios from "../src/pages/AdminRelatorios";

vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }));
vi.mock("../src/components/admin/AdminLayout", () => ({
    default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

const api = vi.mocked(apiFetch);
const revogacoesAgendadas: Array<() => void> = [];
const resumo = {
    clientes: { total: 0, ativos: 0, inativos: 0 },
    motoristas: { total: 0, ativos: 0, inativos: 0 },
    veiculos: { total: 0, disponiveis: 0, manutencao: 0, inativos: 0 },
    viagens: { total: 0, planejadas: 0, em_transito: 0, entregues: 0 },
};

function montar() {
    return render(<NotificationProvider><AdminRelatorios /></NotificationProvider>);
}

function respostaDados(nome_exibicao: string | null = null, logo: string | null = null) {
    return new Response(JSON.stringify({ nome_exibicao, logo }), { status: 200 });
}

function respostaPadrao(rota: string) {
    if (rota === "/api/configuracao/transportadora") return respostaDados();
    if (rota === "/api/configuracao/transportadora/logo") return new Response(null, { status: 404 });
    return new Response(JSON.stringify(resumo), { status: 200 });
}

beforeEach(() => {
    revogacoesAgendadas.length = 0;
    api.mockImplementation(async (rota) => respostaPadrao(rota));
    const URLOriginal = URL;
    vi.stubGlobal("URL", class extends URLOriginal {
        static createObjectURL = vi.fn(() => "blob:relatorio-teste");
        static revokeObjectURL = vi.fn();
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const agendarOriginal = window.setTimeout.bind(window);
    vi.spyOn(window, "setTimeout").mockImplementation((callback, atraso, ...args) => {
        if (atraso === 60_000 && typeof callback === "function") {
            revogacoesAgendadas.push(() => callback(...args));
            return 1;
        }
        return agendarOriginal(callback, atraso, ...args);
    });
    vi.spyOn(window, "print").mockImplementation(() => {});
    vi.spyOn(window, "alert").mockImplementation(() => {
        throw new Error("alert inesperado");
    });
    vi.spyOn(window, "confirm").mockImplementation(() => {
        throw new Error("confirm inesperado");
    });
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.resetAllMocks();
    vi.unstubAllGlobals();
});

describe("download do relatório de viagens", () => {
    it("baixa PDF autenticado, libera recursos e preserva impressão", async () => {
        const pdf = new Blob(["%PDF-1.4"], { type: "application/pdf" });
        api.mockImplementation(async (rota) => rota.endsWith("/pdf")
            ? new Response(pdf, { status: 200 })
            : respostaPadrao(rota));
        montar();

        await screen.findByText("TRANSPORTADORA");
        await waitFor(() => expect((screen.getByRole("button", { name: "Imprimir Relatório" }) as HTMLButtonElement).disabled).toBe(false));
        fireEvent.click(screen.getByRole("button", { name: "Imprimir Relatório" }));
        expect(window.print).toHaveBeenCalledOnce();
        fireEvent.click(screen.getByRole("button", { name: "Baixar Viagens em PDF" }));

        await waitFor(() => expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce());
        expect(api).toHaveBeenCalledWith("/api/admin/relatorios/viagens/pdf");
        expect(URL.createObjectURL).toHaveBeenCalledOnce();
        expect(URL.revokeObjectURL).not.toHaveBeenCalled();
        expect(revogacoesAgendadas).toHaveLength(1);
        expect(document.querySelector('a[download="relatorio_viagens.pdf"]')).toBeNull();
        revogacoesAgendadas[0]();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:relatorio-teste");
        expect(screen.queryByText(/relatório de viagens.*sucesso/i)).toBeNull();
        expect(window.alert).not.toHaveBeenCalled();
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it("mostra erro do backend em toast sem criar URL temporária", async () => {
        api.mockImplementation(async (rota) => rota.endsWith("/pdf")
            ? new Response(JSON.stringify({ erro: "Relatório indisponível." }), { status: 503 })
            : respostaPadrao(rota));
        montar();
        fireEvent.click(screen.getByRole("button", { name: "Baixar Viagens em PDF" }));

        expect((await screen.findByRole("alert")).textContent).toContain("Relatório indisponível.");
        expect(URL.createObjectURL).not.toHaveBeenCalled();
        expect(window.alert).not.toHaveBeenCalled();
    });

    it("libera URL e link mesmo se o clique de download falhar", async () => {
        api.mockImplementation(async (rota) => rota.endsWith("/pdf")
            ? new Response(new Blob(["%PDF-1.4"]), { status: 200 })
            : respostaPadrao(rota));
        vi.mocked(HTMLAnchorElement.prototype.click).mockImplementation(() => {
            throw new Error("Falha ao iniciar download.");
        });
        montar();
        fireEvent.click(screen.getByRole("button", { name: "Baixar Viagens em PDF" }));

        expect((await screen.findByRole("alert")).textContent).toContain("Falha ao iniciar download.");
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:relatorio-teste");
        expect(document.querySelector('a[download="relatorio_viagens.pdf"]')).toBeNull();
    });
});

describe("identidade e relatório financeiro", () => {
    it("mostra nome e logo autenticado na tela e durante a impressão, liberando a URL no unmount", async () => {
        api.mockImplementation(async (rota) => {
            if (rota === "/api/configuracao/transportadora") return respostaDados("Transportadora Exemplo", "referencia-privada");
            if (rota === "/api/configuracao/transportadora/logo") return new Response(new Blob(["imagem"], { type: "image/png" }), { status: 200 });
            return respostaPadrao(rota);
        });
        const tituloOriginal = document.title;
        const tela = montar();

        expect(await screen.findByText("Transportadora Exemplo")).toBeTruthy();
        const imagem = await screen.findByRole("img", { name: "Logotipo de Transportadora Exemplo" });
        expect(imagem.getAttribute("src")).toBe("blob:relatorio-teste");
        expect(api).toHaveBeenCalledWith("/api/configuracao/transportadora/logo");
        expect(screen.getAllByRole("button").map((botao) => botao.textContent)).toEqual([
            "Imprimir Relatório", "Baixar Viagens em PDF", "Baixar Financeiro em PDF",
        ]);
        window.dispatchEvent(new Event("beforeprint"));
        expect(document.title).toBe("Relatório Operacional - Transportadora Exemplo");
        window.dispatchEvent(new Event("afterprint"));
        expect(document.title).toBe(tituloOriginal);

        tela.unmount();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:relatorio-teste");
        expect(window.alert).not.toHaveBeenCalled();
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it("usa fallback neutro sem imagem quando não existe configuração", async () => {
        montar();
        expect(await screen.findByText("TRANSPORTADORA")).toBeTruthy();
        expect(screen.queryByRole("img", { name: /Logotipo de/ })).toBeNull();
        expect(api).not.toHaveBeenCalledWith("/api/configuracao/transportadora/logo");
        window.dispatchEvent(new Event("beforeprint"));
        expect(document.title).toBe("Relatório Operacional - TRANSPORTADORA");
        window.dispatchEvent(new Event("afterprint"));
    });

    it("trata logo ausente como normal mesmo com referência na configuração", async () => {
        api.mockImplementation(async (rota) => rota === "/api/configuracao/transportadora"
            ? respostaDados("Transportadora Exemplo", "referencia-privada")
            : respostaPadrao(rota));
        montar();
        expect(await screen.findByText("Transportadora Exemplo")).toBeTruthy();
        await waitFor(() => expect(api).toHaveBeenCalledWith("/api/configuracao/transportadora/logo"));
        expect(screen.queryByRole("img", { name: /Logotipo de/ })).toBeNull();
        expect(screen.queryByRole("alert")).toBeNull();
    });

    it("baixa PDF financeiro autenticado e libera URL e link temporários", async () => {
        const pdf = new Blob([new Uint8Array(2_707_940)], { type: "application/pdf" });
        const estadoNoClique: Array<{ href: string; download: string; anexado: boolean; revogado: boolean }> = [];
        vi.mocked(HTMLAnchorElement.prototype.click).mockImplementation(function (this: HTMLAnchorElement) {
            estadoNoClique.push({
                href: this.href,
                download: this.download,
                anexado: document.body.contains(this),
                revogado: vi.mocked(URL.revokeObjectURL).mock.calls.length > 0,
            });
        });
        api.mockImplementation(async (rota) => {
            if (rota !== "/api/admin/relatorios/financeiro/pdf") return respostaPadrao(rota);
            const resposta = new Response(null, { status: 200, headers: { "Content-Type": "application/pdf" } });
            vi.spyOn(resposta, "blob").mockResolvedValue(pdf);
            return resposta;
        });
        montar();
        fireEvent.click(screen.getByRole("button", { name: "Baixar Financeiro em PDF" }));

        await waitFor(() => expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce());
        expect(api).toHaveBeenCalledWith("/api/admin/relatorios/financeiro/pdf");
        const arquivoRecebido = vi.mocked(URL.createObjectURL).mock.calls[0][0];
        expect(arquivoRecebido.size).toBe(2_707_940);
        expect(arquivoRecebido.type).toBe("application/pdf");
        expect(estadoNoClique).toEqual([{
            href: "blob:relatorio-teste", download: "relatorio_financeiro.pdf",
            anexado: true, revogado: false,
        }]);
        expect(URL.revokeObjectURL).not.toHaveBeenCalled();
        expect(revogacoesAgendadas).toHaveLength(1);
        expect(document.querySelector('a[download="relatorio_financeiro.pdf"]')).toBeNull();
        revogacoesAgendadas[0]();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:relatorio-teste");
        expect(window.alert).not.toHaveBeenCalled();
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it("mostra erro HTTP financeiro em toast sem criar URL temporária", async () => {
        api.mockImplementation(async (rota) => rota === "/api/admin/relatorios/financeiro/pdf"
            ? new Response(JSON.stringify({ erro: "Financeiro indisponível." }), { status: 503 })
            : respostaPadrao(rota));
        montar();
        fireEvent.click(screen.getByRole("button", { name: "Baixar Financeiro em PDF" }));

        expect((await screen.findByRole("alert")).textContent).toContain("Financeiro indisponível.");
        expect(URL.createObjectURL).not.toHaveBeenCalled();
        expect(window.alert).not.toHaveBeenCalled();
        expect(window.confirm).not.toHaveBeenCalled();
    });
});
