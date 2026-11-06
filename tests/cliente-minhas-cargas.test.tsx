// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PainelCliente from "../src/pages/PainelCliente";
import { listarMinhasCargas } from "../src/services/clienteService";
import type { MinhaCarga } from "../src/types/minhaCarga";

vi.mock("../src/services/clienteService", () => ({ listarMinhasCargas: vi.fn() }));
vi.mock("../src/components/admin/AdminLayout", () => ({ default: ({ children }: { children: ReactNode }) => <main>{children}</main> }));
const listar = vi.mocked(listarMinhasCargas);
const base: MinhaCarga = { id: 1, codigo: "TRK-1", cliente: "Cliente", status: "Em trânsito", origem: "São Paulo/SP", destino: "Santos/SP", local_atual: "Campinas/SP", descricao_carga: "Peças", ultima_atualizacao: "05/11/2026 14:00", previsao_entrega: "06/11/2026 12:00" };
const carga = (id: number, status: string): MinhaCarga => ({ ...base, id, codigo: `TRK-${id}`, status });
function montar(cargas: MinhaCarga[]) { listar.mockResolvedValue(cargas); return render(<MemoryRouter><PainelCliente /></MemoryRouter>); }
afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("Minhas Cargas do cliente", () => {
    it.each([
        ["Em trânsito", "Em andamento"], ["Saiu para entrega", "Em andamento"],
        ["Planejada", "Em preparação"], ["Entregue", "Histórico"],
        ["Finalizada", "Histórico"], ["Cancelada", "Canceladas"],
        ["Estado novo", "Outros status"],
    ])("coloca %s somente em %s", async (status, secao) => {
        montar([carga(1, status)]);
        const grupo = await screen.findByRole("region", { name: `${secao} (1)` });
        expect(within(grupo).getByRole("heading", { name: "TRK-1" })).toBeTruthy();
        expect(screen.getAllByRole("article")).toHaveLength(1);
        expect(screen.queryByRole("heading", { name: "Sua carga está a caminho" })).toBeNull();
    });

    it("não duplica cargas e preserva a ordem em cada seção", async () => {
        montar([carga(1, "Entregue"), carga(2, "Em trânsito"), carga(3, "Cancelada"), carga(4, "Planejada"), carga(5, "Saiu para entrega")]);
        expect(await screen.findAllByRole("article")).toHaveLength(5);
        const andamento = screen.getByRole("region", { name: "Em andamento (2)" });
        expect(within(andamento).getAllByRole("heading", { level: 3 }).map((item) => item.textContent)).toEqual(["TRK-2", "TRK-5"]);
    });

    it.each([
        ["TRK-1", "Código"], ["São Paulo", "Origem"], ["Santos", "Destino"],
        ["Campinas", "Local"], ["Peças", "Descrição"], ["EM TRÂNSITO", "Status"],
    ])("pesquisa por %s (%s)", async (termo) => {
        montar([base, { ...carga(2, "Entregue"), origem: "Outra origem", destino: "Outro destino", local_atual: "Outro local", descricao_carga: "Outra carga" }]);
        const input = await screen.findByRole("searchbox", { name: "Pesquisar cargas" });
        fireEvent.change(input, { target: { value: termo } });
        expect(screen.getAllByRole("article")).toHaveLength(1);
        expect(screen.getByRole("heading", { name: "TRK-1" })).toBeTruthy();
    });

    it("distingue busca sem resultado e restaura categorias ao limpar", async () => {
        montar([base, carga(2, "Entregue")]);
        const input = await screen.findByRole("searchbox", { name: "Pesquisar cargas" });
        fireEvent.change(input, { target: { value: "inexistente" } });
        expect(screen.getByText("Nenhuma carga encontrada para esta pesquisa.")).toBeTruthy();
        fireEvent.change(input, { target: { value: "" } });
        expect(screen.getByRole("region", { name: "Em andamento (1)" })).toBeTruthy();
        expect(screen.getByRole("region", { name: "Histórico (1)" })).toBeTruthy();
    });

    it("trata origem, destino e datas vazias sem inventar valores", async () => {
        montar([{ ...base, origem: "", destino: "", previsao_entrega: "", ultima_atualizacao: "", local_atual: "" }]);
        expect(await screen.findByText("Origem não informada")).toBeTruthy();
        expect(screen.getByText("Destino não informado")).toBeTruthy();
        expect(screen.queryByText("Previsão de entrega")).toBeNull();
        expect(screen.queryByText("Última atualização")).toBeNull();
        expect(document.body.textContent).not.toMatch(/undefined|null|Invalid Date/);
    });

    it("liga cada card ao detalhe correto", async () => {
        montar([base]);
        expect((await screen.findByRole("link", { name: "Acompanhar carga TRK-1" })).getAttribute("href")).toBe("/portal/cliente/minhas-cargas/1");
    });

    it("distingue conta sem cargas de falha da API", async () => {
        montar([]);
        expect(await screen.findByText("Você ainda não possui cargas disponíveis.")).toBeTruthy();
        cleanup();
        listar.mockRejectedValue(new Error("Falha no serviço"));
        render(<MemoryRouter><PainelCliente /></MemoryRouter>);
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Falha no serviço");
        expect(screen.queryByText("Você ainda não possui cargas disponíveis.")).toBeNull();
    });

    it("limita listas longas e reinicia a expansão ao pesquisar", async () => {
        montar(Array.from({ length: 8 }, (_, index) => carga(index + 1, "Em trânsito")));
        expect(await screen.findAllByRole("article")).toHaveLength(6);
        fireEvent.click(screen.getByRole("button", { name: "Mostrar mais em em andamento" }));
        expect(screen.getAllByRole("article")).toHaveLength(8);
        const input = screen.getByRole("searchbox", { name: "Pesquisar cargas" });
        fireEvent.change(input, { target: { value: "TRK" } });
        expect(screen.getAllByRole("article")).toHaveLength(6);
    });
});
