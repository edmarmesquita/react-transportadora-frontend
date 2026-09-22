import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationProvider } from "../src/components/ui/NotificationProvider";
import App from "../src/App";

vi.mock("../src/pages/Home", () => ({
    default: () => <div>Home síncrona</div>,
}));
vi.mock("../src/pages/AdminDashboard", () => ({
    default: () => <div>Dashboard lazy</div>,
}));
vi.mock("../src/pages/AdminClientes", () => ({
    default: () => <div>Clientes lazy</div>,
}));
vi.mock("../src/pages/PortalClienteHome", () => ({
    default: () => <div>Portal cliente lazy</div>,
}));
vi.mock("../src/pages/PainelMotorista", () => ({
    default: () => <div>Portal motorista lazy</div>,
}));
vi.mock("../src/pages/Sobre", () => ({
    default: () => <div>Sobre lazy</div>,
}));

function acessar(rota: string, perfil?: string) {
    window.history.pushState({}, "", rota);

    if (perfil) {
        sessionStorage.setItem("accessToken", "token-hml");
        sessionStorage.setItem(
            "usuarioLogado",
            JSON.stringify({ perfil })
        );
    }

    return render(
        <NotificationProvider>
            <App />
        </NotificationProvider>
    );
}

beforeEach(() => {
    sessionStorage.clear();
});

afterEach(() => {
    cleanup();
    sessionStorage.clear();
});

describe("code splitting por rota", () => {
    it("mantém a Home no carregamento inicial", () => {
        acessar("/");

        expect(screen.getByText("Home síncrona")).toBeTruthy();
    });

    it.each([
        ["/admin", "administrador", "Dashboard lazy"],
        ["/portal/cliente", "cliente", "Portal cliente lazy"],
        ["/portal/motorista", "motorista", "Portal motorista lazy"],
        ["/sobre", undefined, "Sobre lazy"],
    ])("carrega a rota %s sob demanda", async (rota, perfil, texto) => {
        acessar(rota, perfil);

        expect(screen.getByRole("status").textContent).toBe("Carregando...");
        expect(await screen.findByText(texto)).toBeTruthy();
    });

    it("preserva a permissão ao carregar uma rota administrativa direta", async () => {
        acessar("/admin/clientes", "cliente");

        expect(
            await screen.findByRole("heading", {
                name: /Acesso.*autorizado/i,
            })
        ).toBeTruthy();
        expect(screen.queryByText("Clientes lazy")).toBeNull();
    });
});
