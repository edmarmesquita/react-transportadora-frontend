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
const resumo = {
    clientes: { total: 0, ativos: 0, inativos: 0 },
    motoristas: { total: 0, ativos: 0, inativos: 0 },
    veiculos: { total: 0, disponiveis: 0, manutencao: 0, inativos: 0 },
    viagens: { total: 0, planejadas: 0, em_transito: 0, entregues: 0 },
};

function montar() {
    return render(<NotificationProvider><AdminRelatorios /></NotificationProvider>);
}

beforeEach(() => {
    api.mockImplementation(async () => new Response(JSON.stringify(resumo), { status: 200 }));
    const URLOriginal = URL;
    vi.stubGlobal("URL", class extends URLOriginal {
        static createObjectURL = vi.fn(() => "blob:relatorio-teste");
        static revokeObjectURL = vi.fn();
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    vi.spyOn(window, "print").mockImplementation(() => {});
    vi.spyOn(window, "alert").mockImplementation(() => {
        throw new Error("alert inesperado");
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
            : new Response(JSON.stringify(resumo), { status: 200 }));
        montar();

        fireEvent.click(screen.getByRole("button", { name: "Imprimir Relatório" }));
        expect(window.print).toHaveBeenCalledOnce();
        fireEvent.click(screen.getByRole("button", { name: "Baixar Viagens em PDF" }));

        await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:relatorio-teste"));
        expect(api).toHaveBeenCalledWith("/api/admin/relatorios/viagens/pdf");
        expect(URL.createObjectURL).toHaveBeenCalledOnce();
        expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
        expect(document.querySelector('a[download="relatorio_viagens.pdf"]')).toBeNull();
        expect(screen.queryByText(/relatório de viagens.*sucesso/i)).toBeNull();
        expect(window.alert).not.toHaveBeenCalled();
    });

    it("mostra erro do backend em toast sem criar URL temporária", async () => {
        api.mockImplementation(async (rota) => rota.endsWith("/pdf")
            ? new Response(JSON.stringify({ erro: "Relatório indisponível." }), { status: 503 })
            : new Response(JSON.stringify(resumo), { status: 200 }));
        montar();
        fireEvent.click(screen.getByRole("button", { name: "Baixar Viagens em PDF" }));

        expect((await screen.findByRole("alert")).textContent).toContain("Relatório indisponível.");
        expect(URL.createObjectURL).not.toHaveBeenCalled();
        expect(window.alert).not.toHaveBeenCalled();
    });

    it("libera URL e link mesmo se o clique de download falhar", async () => {
        api.mockImplementation(async (rota) => rota.endsWith("/pdf")
            ? new Response(new Blob(["%PDF-1.4"]), { status: 200 })
            : new Response(JSON.stringify(resumo), { status: 200 }));
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
