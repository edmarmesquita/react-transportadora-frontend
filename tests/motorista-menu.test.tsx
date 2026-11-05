import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import AdminLayout from "../src/components/admin/AdminLayout";
import { buscarUsuarioLogado, logout } from "../src/services/authService";

vi.mock("../src/services/authService", () => ({ buscarUsuarioLogado: vi.fn(), logout: vi.fn() }));
const usuario = vi.mocked(buscarUsuarioLogado);
const sair = vi.mocked(logout);

function RotaAtual() {
    return <output data-testid="rota-atual">{useLocation().pathname}</output>;
}

function montar(perfil: string, rota = "/portal/motorista", nome = "Marcos Vinícius Rocha") {
    usuario.mockReturnValue({ id: 1, nome, usuario: "marcos", perfil });
    return render(
        <MemoryRouter initialEntries={[rota]}>
            <AdminLayout><RotaAtual /></AdminLayout>
        </MemoryRouter>
    );
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("menu do motorista", () => {
    it("usa rotas reais, grupos e identificação da sessão sem itens fictícios", () => {
        montar("motorista");
        const menu = screen.getByRole("navigation", { name: "Menu do motorista" });
        expect(within(menu).getByText("Área principal")).toBeTruthy();
        expect(within(menu).getByText("Conta")).toBeTruthy();
        expect(within(menu).getByRole("link", { name: "Início" }).getAttribute("href")).toBe("/portal/motorista");
        expect(within(menu).getByRole("link", { name: "Minhas Viagens" }).getAttribute("href")).toBe("/portal/motorista");
        expect(within(menu).getByRole("link", { name: "Meu Perfil" }).getAttribute("href")).toBe("/admin/meu-perfil");
        const lateral = document.querySelector("aside.motorista-sidebar")!;
        expect(within(lateral).getByText("Marcos Vinícius Rocha")).toBeTruthy();
        expect(within(lateral).getByText("Motorista")).toBeTruthy();
        for (const item of ["Ajuda", "Notificações", "Configurações"]) expect(within(menu).queryByText(item)).toBeNull();
    });

    it("marca somente Minhas Viagens como ativa na página inicial e no detalhe", () => {
        const { unmount } = montar("motorista");
        const menu = screen.getByRole("navigation", { name: "Menu do motorista" });
        expect(within(menu).getByRole("link", { name: "Minhas Viagens" }).classList.contains("active")).toBe(true);
        expect(within(menu).getByRole("link", { name: "Início" }).classList.contains("active")).toBe(false);
        unmount();
        montar("motorista", "/portal/motorista/minhas-viagens/7");
        expect(screen.getByRole("link", { name: "Minhas Viagens" }).classList.contains("active")).toBe(true);
    });

    it("abre, fecha pelo overlay e fecha ao navegar", () => {
        montar("motorista");
        const lateral = document.querySelector("aside.motorista-sidebar")!;
        const abrir = screen.getByRole("button", { name: "Abrir menu do motorista" });
        fireEvent.click(abrir);
        expect(lateral.classList.contains("aberta")).toBe(true);
        expect(document.activeElement?.textContent).toContain("Início");
        expect(document.querySelector(".admin-menu-toggle")?.getAttribute("aria-expanded")).toBe("true");
        fireEvent.click(document.querySelector(".admin-sidebar-overlay")!);
        expect(lateral.classList.contains("aberta")).toBe(false);
        expect(document.activeElement?.classList.contains("admin-menu-toggle")).toBe(true);
        fireEvent.click(screen.getByRole("button", { name: "Abrir menu do motorista" }));
        fireEvent.click(screen.getByRole("link", { name: "Meu Perfil" }));
        expect(lateral.classList.contains("aberta")).toBe(false);
        expect(screen.getByTestId("rota-atual").textContent).toBe("/admin/meu-perfil");
    });

    it("reutiliza o logout e redirecionamento da topbar", () => {
        montar("motorista");
        const lateral = document.querySelector("aside.motorista-sidebar")!;
        fireEvent.click(within(lateral).getByRole("button", { name: "Sair" }));
        expect(sair).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("rota-atual").textContent).toBe("/admin/login");
    });

    it("usa identificação disponível quando o nome falta", () => {
        montar("motorista", "/portal/motorista", "");
        expect(screen.getByText("marcos")).toBeTruthy();
    });

    it.each(["administrador", "operador"])("preserva o menu de %s", (perfil) => {
        montar(perfil, "/admin");
        expect(document.querySelector("aside.motorista-sidebar")).toBeNull();
        expect(screen.queryByRole("navigation", { name: "Menu do motorista" })).toBeNull();
        expect(screen.getByRole("link", { name: "Dashboard" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Viagens" })).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Início" })).toBeNull();
    });
});
