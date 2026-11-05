import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalheViagem from "../src/pages/DetalheViagem";
import { NotificationProvider } from "../src/components/ui/NotificationProvider";
import { apiFetch } from "../src/services/api";

vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }));
vi.mock("../src/components/admin/AdminLayout", () => ({ default: ({ children }: { children: ReactNode }) => <main>{children}</main> }));

const api = vi.mocked(apiFetch);
const viagemBase = { id: 7, codigo_carga: "TRK-TESTE", cliente: "Cliente", motorista: "Motorista", veiculo: "MNO5P67", origem: "São Paulo/SP", destino: "São José dos Campos/SP", status: "Em trânsito", data_criacao: "Hoje", data_saida: "10:00", previsao_entrega: "14:00" };
let viagem = { ...viagemBase };

function resposta(dados: unknown) { return new Response(JSON.stringify(dados), { status: 200, headers: { "Content-Type": "application/json" } }); }
function montar(perfil: string) {
    sessionStorage.setItem("usuarioLogado", JSON.stringify({ perfil }));
    const caminho = perfil === "motorista" ? "/portal/motorista/minhas-viagens/7" : "/admin/viagens/7";
    return render(<NotificationProvider><MemoryRouter initialEntries={[caminho]}><Routes><Route path={perfil === "motorista" ? "/portal/motorista/minhas-viagens/:id" : "/admin/viagens/:id"} element={<DetalheViagem />} /></Routes></MemoryRouter></NotificationProvider>);
}

beforeEach(() => {
    viagem = { ...viagemBase };
    api.mockImplementation(async (endpoint, options) => {
        if (endpoint.endsWith("/status") && options?.method === "POST") {
            viagem = { ...viagem, status: JSON.parse(String(options.body)).status };
            return resposta({ mensagem: "Atualizado" });
        }
        if (endpoint.endsWith("/localizacoes")) return resposta([]);
        if (endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
        if (endpoint.endsWith("/comprovante")) return resposta({});
        if (endpoint.endsWith("/7")) return resposta(viagem);
        throw new Error(`Endpoint inesperado: ${endpoint}`);
    });
});
afterEach(() => { cleanup(); sessionStorage.clear(); vi.clearAllMocks(); });

describe("detalhe operacional do motorista", () => {
    it("mostra rota, status, placa, código e datas apenas ao motorista", async () => {
        montar("motorista");
        const painel = await screen.findByRole("region", { name: "Rota da viagem" });
        for (const texto of ["São Paulo/SP", "São José dos Campos/SP", "Status atual: Em trânsito", "MNO5P67", "TRK-TESTE", "10:00", "14:00"]) expect(within(painel).getByText(texto)).toBeTruthy();
        expect(screen.queryByRole("combobox")).toBeNull();
    });

    it.each(["administrador", "operador"])("preserva o detalhe administrativo para %s", async (perfil) => {
        montar(perfil);
        expect(await screen.findByText("Atualizar status")).toBeTruthy();
        expect(screen.getByRole("combobox")).toBeTruthy();
        expect(screen.queryByRole("region", { name: "Rota da viagem" })).toBeNull();
    });

    it("codifica o destino nos links oficiais de Maps e Waze", async () => {
        montar("motorista");
        const maps = await screen.findByRole("link", { name: "Abrir destino no Google Maps (abre em nova aba)" });
        const waze = screen.getByRole("link", { name: "Abrir destino no Waze (abre em nova aba)" });
        expect(maps.getAttribute("href")).toBe("https://www.google.com/maps/dir/?api=1&destination=S%C3%A3o%20Jos%C3%A9%20dos%20Campos%2FSP&travelmode=driving");
        expect(waze.getAttribute("href")).toBe("https://waze.com/ul?q=S%C3%A3o%20Jos%C3%A9%20dos%20Campos%2FSP&navigate=yes");
        expect(maps.getAttribute("rel")).toBe("noopener noreferrer");
        expect(waze.getAttribute("target")).toBe("_blank");
    });

    it("não cria links quebrados com destino ausente", async () => {
        viagem = { ...viagem, destino: "" };
        montar("motorista");
        const painel = await screen.findByRole("region", { name: "Rota da viagem" });
        expect(within(painel).queryByRole("link")).toBeNull();
        expect(within(painel).getByText("Google Maps indisponível")).toBeTruthy();
        expect(within(painel).getByText("Waze indisponível")).toBeTruthy();
    });

    it("omite datas indisponíveis e preserva o comprovante em Saiu para entrega", async () => {
        viagem = { ...viagem, status: "Saiu para entrega", data_saida: "", previsao_entrega: "" };
        montar("motorista");
        const painel = await screen.findByRole("region", { name: "Rota da viagem" });
        expect(within(painel).queryByText("Saída real")).toBeNull();
        expect(within(painel).queryByText("Previsão de entrega")).toBeNull();
        expect(screen.getByRole("heading", { name: "Finalizar Entrega" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Marcar como entregue" })).toBeNull();
    });

    it("leva com foco às seções existentes de localização e ocorrência", async () => {
        montar("motorista");
        fireEvent.click(await screen.findByRole("button", { name: "Atualizar localização" }));
        expect(document.activeElement?.id).toBe("motorista-localizacao");
        fireEvent.click(screen.getByRole("button", { name: "Registrar ocorrência" }));
        expect(document.activeElement?.id).toBe("motorista-ocorrencia");
        expect(document.querySelectorAll("#motorista-localizacao")).toHaveLength(1);
        expect(document.querySelectorAll("#motorista-ocorrencia")).toHaveLength(1);
    });

    it("confirma a próxima transição, cancela sem request e atualiza pela API existente", async () => {
        montar("motorista");
        fireEvent.click(await screen.findByRole("button", { name: "Marcar como saiu para entrega" }));
        const dialogo = screen.getByRole("dialog", { name: "Confirmar alteração de status" });
        expect(within(dialogo).getByText(/Status atual: Em trânsito.*Novo status: Saiu para entrega.*Timeline/)).toBeTruthy();
        fireEvent.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
        expect(api.mock.calls.some(([endpoint, options]) => endpoint.endsWith("/status") && options?.method === "POST")).toBe(false);
        fireEvent.click(screen.getByRole("button", { name: "Marcar como saiu para entrega" }));
        fireEvent.click(screen.getByRole("button", { name: "Confirmar alteração" }));
        await waitFor(() => expect(api).toHaveBeenCalledWith("/api/motorista/minhas-viagens/7/status", expect.objectContaining({ method: "POST", body: JSON.stringify({ status: "Saiu para entrega" }) })));
        expect(await screen.findByRole("heading", { name: "Finalizar Entrega" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Marcar como entregue" })).toBeNull();
    });

    it.each(["Entregue", "Finalizada", "Cancelada"])("não mostra próxima ação em %s", async (status) => {
        viagem = { ...viagem, status };
        montar("motorista");
        await screen.findByRole("region", { name: "Rota da viagem" });
        expect(screen.queryByText("Próxima ação operacional")).toBeNull();
    });
});
