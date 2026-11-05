import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PainelMotorista from "../src/pages/PainelMotorista";
import AdminTopbar from "../src/components/admin/AdminTopbar";
import { listarMinhasViagens } from "../src/services/motoristaService";
import { buscarUsuarioLogado } from "../src/services/authService";
import type { MinhaViagem } from "../src/types/minhaViagem";

vi.mock("../src/services/motoristaService", () => ({ listarMinhasViagens: vi.fn() }));
vi.mock("../src/services/authService", () => ({ buscarUsuarioLogado: vi.fn(), logout: vi.fn() }));

const listar = vi.mocked(listarMinhasViagens);
const usuario = vi.mocked(buscarUsuarioLogado);
const base: MinhaViagem = { id: 7, origem: "São Paulo/SP", destino: "São José dos Campos/SP", status: "Em trânsito", carga_codigo: "TRK-TESTE", veiculo: "MNO5P67", data_saida: "05/11/2026 10:00", previsao_entrega: "05/11/2026 13:00" };

function montar(viagens: MinhaViagem[]) {
    listar.mockResolvedValue(viagens);
    usuario.mockReturnValue({ nome: "Motorista", perfil: "motorista" } as ReturnType<typeof buscarUsuarioLogado>);
    return render(<MemoryRouter><PainelMotorista /></MemoryRouter>);
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("painel do motorista", () => {
    it("mostra carregamento enquanto a API responde", () => {
        listar.mockReturnValue(new Promise(() => {}));
        usuario.mockReturnValue({ nome: "Motorista", perfil: "motorista" } as ReturnType<typeof buscarUsuarioLogado>);
        render(<MemoryRouter><PainelMotorista /></MemoryRouter>);
        expect(screen.getByRole("status").textContent).toContain("Carregando suas viagens");
    });

    it("mostra erro da API", async () => {
        listar.mockRejectedValue(new Error("Falha ao carregar viagens"));
        usuario.mockReturnValue({ nome: "Motorista", perfil: "motorista" } as ReturnType<typeof buscarUsuarioLogado>);
        render(<MemoryRouter><PainelMotorista /></MemoryRouter>);
        expect((await screen.findByRole("alert")).textContent).toBe("Falha ao carregar viagens");
    });

    it("destaca uma viagem ativa e abre seu detalhe", async () => {
        montar([base]);
        const secao = await screen.findByRole("region", { name: "Viagens em andamento" });
        expect(within(secao).getByText("São Paulo/SP")).toBeTruthy();
        expect(within(secao).getByText("São José dos Campos/SP")).toBeTruthy();
        expect(within(secao).getByText("MNO5P67")).toBeTruthy();
        expect(within(secao).getByText("05/11/2026 10:00")).toBeTruthy();
        expect(within(secao).getByRole("link", { name: "Abrir viagem TRK-TESTE" }).getAttribute("href")).toBe("/portal/motorista/minhas-viagens/7");
        expect(screen.queryByRole("table")).toBeNull();
        expect(screen.queryByRole("region", { name: "Histórico de viagens" })).toBeNull();
    });

    it.each(["Entregue", "Finalizada", "Cancelada"])("separa %s no histórico", async (status) => {
        montar([{ ...base, status }]);
        const secao = await screen.findByRole("region", { name: "Histórico de viagens" });
        expect(within(secao).getByText(status)).toBeTruthy();
        expect(screen.queryByRole("region", { name: "Viagens em andamento" })).toBeNull();
    });

    it("mostra ativas e histórico em seções distintas, inclusive múltiplas ativas", async () => {
        montar([base, { ...base, id: 8, carga_codigo: "TRK-2", status: "Planejada" }, { ...base, id: 9, carga_codigo: "TRK-3", status: "Entregue" }]);
        const ativas = await screen.findByRole("region", { name: "Viagens em andamento" });
        const historico = screen.getByRole("region", { name: "Histórico de viagens" });
        expect(within(ativas).getAllByRole("article")).toHaveLength(2);
        expect(within(historico).getAllByRole("article")).toHaveLength(1);
    });

    it("mostra estado vazio", async () => {
        montar([]);
        expect(await screen.findByText("Nenhuma viagem vinculada a este motorista.")).toBeTruthy();
    });

    it("omite datas ausentes e apresenta texto seguro para outros campos opcionais", async () => {
        montar([{ ...base, data_saida: null, previsao_entrega: undefined, veiculo: "", origem: "" }]);
        const card = (await screen.findByRole("region", { name: "Viagens em andamento" })).querySelector("article")!;
        expect(within(card).getAllByText("Não informado")).toHaveLength(2);
        expect(within(card).queryByText("Saída real")).toBeNull();
        expect(within(card).queryByText("Previsão de entrega")).toBeNull();
        expect(card.textContent).not.toMatch(/undefined|null/);
    });
});

describe("cabeçalho compartilhado", () => {
    it.each([
        ["motorista", "Central operacional do motorista"],
        ["administrador", "Central administrativa de cargas, viagens e entregas"],
        ["operador", "Central administrativa de cargas, viagens e entregas"],
    ])("mostra o texto adequado para %s", (perfil, esperado) => {
        usuario.mockReturnValue({ nome: "Pessoa", perfil } as ReturnType<typeof buscarUsuarioLogado>);
        render(<MemoryRouter><AdminTopbar /></MemoryRouter>);
        expect(screen.getByText(esperado)).toBeTruthy();
    });
});
