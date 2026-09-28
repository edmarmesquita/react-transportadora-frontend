import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { NotificationProvider } from "../src/components/ui/NotificationProvider";
import { apiFetch } from "../src/services/api";
import DadosTransportadora from "../src/pages/DadosTransportadora";

vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }));
vi.mock("../src/components/admin/AdminLayout", () => ({
    default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

const api = vi.mocked(apiFetch);

afterEach(() => {
    cleanup();
    vi.resetAllMocks();
});

describe("Dados da Transportadora", () => {
    it("carrega dados existentes e salva pelo endpoint próprio sem enviar logo", async () => {
        api.mockImplementation(async (_rota, opcoes) => new Response(JSON.stringify(
            opcoes?.method === "PUT"
                ? { nome_exibicao: "Nova Operadora", razao_social: "Operadora Ltda", logo: null }
                : { nome_exibicao: "Operadora", razao_social: "Operadora Ltda", logo: null }
        ), { status: 200 }));

        render(
            <NotificationProvider>
                <MemoryRouter><DadosTransportadora /></MemoryRouter>
            </NotificationProvider>
        );

        const nome = await screen.findByLabelText("Nome de exibição") as HTMLInputElement;
        expect(nome.value).toBe("Operadora");
        fireEvent.change(nome, { target: { value: "Nova Operadora" } });
        fireEvent.click(screen.getByRole("button", { name: "Salvar dados" }));

        await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
        const [rota, opcoes] = api.mock.calls[1];
        expect(rota).toBe("/api/configuracao/transportadora");
        expect(opcoes?.method).toBe("PUT");
        const enviado = JSON.parse(String(opcoes?.body));
        expect(enviado.nome_exibicao).toBe("Nova Operadora");
        expect(enviado).not.toHaveProperty("logo");
        expect(await screen.findByText("Dados da transportadora atualizados.")).toBeTruthy();
    });
});
