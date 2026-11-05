// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PortalClienteHome from "../src/pages/PortalClienteHome";
import { listarMinhasCargas } from "../src/services/clienteService";
import type { MinhaCarga } from "../src/types/minhaCarga";

vi.mock("../src/services/clienteService", () => ({ listarMinhasCargas: vi.fn() }));
vi.mock("../src/components/admin/AdminLayout", () => ({ default: ({ children }: { children: ReactNode }) => <main>{children}</main> }));

const listar = vi.mocked(listarMinhasCargas);
const base: MinhaCarga = { id: 1, codigo: "TRK-1", cliente: "Cliente", status: "Em trânsito", origem: "São Paulo/SP", local_atual: "Local informado", destino: "São José dos Campos/SP", previsao_entrega: "05/11/2026 12:30", ultima_atualizacao: "05/11/2026 15:53" };

function montar(cargas: MinhaCarga[]) {
    listar.mockResolvedValue(cargas);
    return render(<MemoryRouter><PortalClienteHome /></MemoryRouter>);
}

afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("Home do Cliente 2.0", () => {
    it("destaca carga em trânsito com rota, previsão, status e link direto", async () => {
        montar([base]);
        expect(await screen.findByRole("heading", { name: "Sua carga está a caminho" })).toBeTruthy();
        expect(screen.getByText("São Paulo/SP")).toBeTruthy();
        expect(screen.getByText("São José dos Campos/SP")).toBeTruthy();
        expect(screen.getByText("05/11/2026 12:30")).toBeTruthy();
        expect(screen.getByText("Em trânsito", { selector: ".cliente-home-status" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Acompanhar carga" }).getAttribute("href")).toBe("/portal/cliente/minhas-cargas/1");
    });

    it("trata Saiu para entrega como andamento", async () => {
        montar([{ ...base, status: " Saiu   para entrega " }]);
        expect(await screen.findByRole("heading", { name: "Sua carga está a caminho" })).toBeTruthy();
    });

    it("apresenta pré-operação sem mensagem de carga a caminho", async () => {
        montar([{ ...base, status: "Planejada", data_prevista_saida: "06/11/2026 08:00" }]);
        expect(await screen.findByRole("heading", { name: "Próxima carga" })).toBeTruthy();
        expect(screen.queryByText("Sua carga está a caminho")).toBeNull();
        expect(screen.getByText("06/11/2026 08:00")).toBeTruthy();
    });

    it.each(["Entregue", "Finalizada", "Cancelada", "Estado futuro"])("não promove %s a carga ativa", async (status) => {
        montar([{ ...base, status }]);
        expect(await screen.findByRole("heading", { name: "Nenhuma carga em andamento" })).toBeTruthy();
        expect(screen.queryByText("Sua carga está a caminho")).toBeNull();
        expect(screen.getByRole("link", { name: "Ver histórico de cargas" }).getAttribute("href")).toBe("/portal/cliente/minhas-cargas");
        expect(screen.getByText("0", { selector: ".cliente-home-resumo > div:first-child strong" })).toBeTruthy();
    });

    it("seleciona a primeira carga ativa na ordem da API e não a duplica", async () => {
        montar([
            { ...base, id: 1, codigo: "CONCLUIDA", status: "Entregue" },
            { ...base, id: 2, codigo: "PLANEJADA", status: "Planejada" },
            { ...base, id: 3, codigo: "ATIVA-1" },
            { ...base, id: 4, codigo: "ATIVA-2" },
        ]);
        expect(await screen.findByRole("heading", { name: "Sua carga está a caminho" })).toBeTruthy();
        expect(screen.getByText("ATIVA-1")).toBeTruthy();
        expect(screen.getAllByRole("link", { name: "Acompanhar carga" })[0].getAttribute("href")).toBe("/portal/cliente/minhas-cargas/3");
        expect(screen.getByRole("heading", { name: "Outras cargas em andamento" })).toBeTruthy();
        expect(screen.getByRole("heading", { name: "ATIVA-2" })).toBeTruthy();
        expect(screen.queryByRole("heading", { name: "ATIVA-1" })).toBeNull();
    });

    it("não usa local atual como origem e omite datas vazias", async () => {
        montar([{ ...base, origem: "", local_atual: "Local informado", previsao_entrega: "", ultima_atualizacao: "" }]);
        expect(await screen.findByText("Origem não informada")).toBeTruthy();
        expect(screen.getByText("Local informado")).toBeTruthy();
        expect(screen.queryByText("Previsão de entrega")).toBeNull();
        expect(screen.queryByText("Última atualização")).toBeNull();
        expect(document.body.textContent).not.toMatch(/undefined|null|Invalid Date/);
    });

    it("distingue lista vazia de falha da API", async () => {
        montar([]);
        expect(await screen.findByRole("heading", { name: "Nenhuma carga disponível" })).toBeTruthy();
        cleanup();
        listar.mockRejectedValue(new Error("Serviço indisponível"));
        render(<MemoryRouter><PortalClienteHome /></MemoryRouter>);
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Serviço indisponível");
        expect(screen.queryByRole("heading", { name: "Nenhuma carga disponível" })).toBeNull();
    });
});
