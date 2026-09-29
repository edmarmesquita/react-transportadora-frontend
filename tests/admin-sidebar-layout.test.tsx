import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import AdminSidebar from "../src/components/admin/AdminSidebar";

vi.mock("../src/services/authService", () => ({
    buscarUsuarioLogado: () => ({ perfil: "administrador" }),
}));

afterEach(cleanup);

describe("menu administrativo", () => {
    it("usa a mesma estrutura de texto para todos os links e preserva o estado ativo", () => {
        render(
            <MemoryRouter initialEntries={["/admin/dados-transportadora"]}>
                <AdminSidebar aberto={false} fecharMenu={() => {}} />
            </MemoryRouter>
        );

        const link = screen.getByRole("link", { name: "Dados da Transportadora" });
        expect(link.classList.contains("active")).toBe(true);
        expect(link.querySelector("span")?.textContent).toBe("Dados da Transportadora");
        expect(screen.getByRole("link", { name: "Dashboard" }).querySelector("span")?.textContent).toBe("Dashboard");
        expect(screen.getByRole("link", { name: "Relatórios" }).querySelector("span")?.textContent).toBe("Relatórios");
    });
});
