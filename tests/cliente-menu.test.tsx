// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import AdminLayout from "../src/components/admin/AdminLayout";
import { buscarUsuarioLogado, logout } from "../src/services/authService";

vi.mock("../src/services/authService", () => ({ buscarUsuarioLogado: vi.fn(), logout: vi.fn() }));
const usuario = vi.mocked(buscarUsuarioLogado);
const sair = vi.mocked(logout);

function RotaAtual() { return <output data-testid="rota-atual">{useLocation().pathname}</output>; }
function montar(perfil: string, rota = "/portal/cliente") {
    usuario.mockReturnValue({ id: 1, nome: "Ana Cliente", usuario: "ana", perfil });
    return render(<MemoryRouter initialEntries={[rota]}><AdminLayout><RotaAtual /></AdminLayout></MemoryRouter>);
}
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("navegação do Cliente 2.0", () => {
    it("mostra somente as três rotas reais do cliente", () => {
        montar("cliente");
        const menu = screen.getByRole("navigation", { name: "Menu do cliente" });
        expect(within(menu).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
            ["Início", "/portal/cliente"],
            ["Minhas Cargas", "/portal/cliente/minhas-cargas"],
            ["Meu Perfil", "/portal/cliente/perfil"],
        ]);
        for (const item of ["Dashboard", "Viagens", "Relatórios", "Financeiro", "Suporte"]) expect(within(menu).queryByText(item)).toBeNull();
    });

    it("destaca a rota ativa inclusive no detalhe", () => {
        const { unmount } = montar("cliente");
        expect(screen.getByRole("link", { name: "Início" }).classList.contains("active")).toBe(true);
        expect(screen.getByRole("link", { name: "Minhas Cargas" }).classList.contains("active")).toBe(false);
        unmount();
        montar("cliente", "/portal/cliente/minhas-cargas/5");
        expect(screen.getByRole("link", { name: "Minhas Cargas" }).classList.contains("active")).toBe(true);
        expect(screen.getByRole("link", { name: "Início" }).classList.contains("active")).toBe(false);
    });

    it("usa comunicação própria, identificação real e ação Sair", () => {
        montar("cliente");
        const topo = screen.getByRole("banner");
        expect(within(topo).getByRole("heading", { name: "Portal do Cliente" })).toBeTruthy();
        expect(within(topo).getByText("Acompanhe suas cargas e entregas")).toBeTruthy();
        expect(within(topo).getByText("Ana Cliente")).toBeTruthy();
        expect(within(topo).getByText("Cliente")).toBeTruthy();
        expect(within(topo).getByRole("button", { name: "Sair" })).toBeTruthy();
        expect(screen.queryByText("Central administrativa de cargas, viagens e entregas")).toBeNull();
        expect(screen.getByRole("heading", { name: "ROTANZA" })).toBeTruthy();
    });

    it("abre, fecha e mantém acesso às três rotas no painel mobile", () => {
        montar("cliente");
        const lateral = document.querySelector("aside.cliente-sidebar")!;
        const alternador = screen.getByRole("button", { name: "Abrir menu do cliente" });
        fireEvent.click(alternador);
        expect(lateral.classList.contains("aberta")).toBe(true);
        expect(alternador.getAttribute("aria-expanded")).toBe("true");
        expect(document.activeElement?.textContent).toBe("Início");
        for (const item of ["Início", "Minhas Cargas", "Meu Perfil"]) expect(within(lateral).getByRole("link", { name: item })).toBeTruthy();
        fireEvent.click(alternador);
        expect(lateral.classList.contains("aberta")).toBe(false);
        fireEvent.click(screen.getByRole("button", { name: "Abrir menu do cliente" }));
        fireEvent.click(document.querySelector(".admin-sidebar-overlay")!);
        expect(lateral.classList.contains("aberta")).toBe(false);
    });

    it("fecha ao navegar e preserva Sair no menu mobile", () => {
        montar("cliente");
        const lateral = document.querySelector("aside.cliente-sidebar")!;
        fireEvent.click(screen.getByRole("button", { name: "Abrir menu do cliente" }));
        fireEvent.click(within(lateral).getByRole("link", { name: "Minhas Cargas" }));
        expect(lateral.classList.contains("aberta")).toBe(false);
        expect(screen.getByTestId("rota-atual").textContent).toBe("/portal/cliente/minhas-cargas");
        fireEvent.click(within(lateral).getByRole("button", { name: "Sair" }));
        expect(sair).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("rota-atual").textContent).toBe("/admin/login");
    });

    it("preserva o menu do motorista", () => {
        montar("motorista", "/portal/motorista");
        expect(screen.getByRole("navigation", { name: "Menu do motorista" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Minhas Viagens" })).toBeTruthy();
        expect(screen.queryByRole("navigation", { name: "Menu do cliente" })).toBeNull();
        expect(screen.getByText("Central operacional do motorista")).toBeTruthy();
    });

    it.each(["administrador", "operador"])("preserva o menu de %s", (perfil) => {
        montar(perfil, "/admin");
        expect(screen.getByRole("link", { name: "Dashboard" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Viagens" })).toBeTruthy();
        expect(screen.queryByRole("navigation", { name: "Menu do cliente" })).toBeNull();
        expect(screen.queryByRole("link", { name: "Minhas Cargas" })).toBeNull();
        expect(screen.getByText("Central administrativa de cargas, viagens e entregas")).toBeTruthy();
    });
});
