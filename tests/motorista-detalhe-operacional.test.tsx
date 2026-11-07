import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalheViagem from "../src/pages/DetalheViagem";
import { NotificationProvider } from "../src/components/ui/NotificationProvider";
import { apiFetch } from "../src/services/api";

vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }));
vi.mock("../src/components/admin/AdminLayout", () => ({ default: ({ children, className }: { children: ReactNode; className?: string }) => <main className={className}>{children}</main> }));

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
        if (endpoint.endsWith("/localizacoes/gps")) return resposta({ mensagem: "Localização atualizada.", data_registro: "2026-11-05T18:53:50Z" });
        if (endpoint.endsWith("/localizacoes")) return resposta([]);
        if (endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
        if (endpoint.endsWith("/comprovante")) return resposta({});
        if (endpoint.endsWith("/7")) return resposta(viagem);
        throw new Error(`Endpoint inesperado: ${endpoint}`);
    });
});
afterEach(() => { cleanup(); sessionStorage.clear(); vi.clearAllMocks(); });

describe("detalhe operacional do motorista", () => {
    it("captures GPS only after an explicit action and prevents duplicate submits", async () => {
        let success!: PositionCallback;
        const getCurrentPosition = vi.fn((callback: PositionCallback) => { success = callback; });
        Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
        montar("motorista");
        const button = await screen.findByRole("button", { name: "Atualizar localiza\u00e7\u00e3o por GPS" });
        expect(screen.getByRole("heading", { name: "Histórico de localizações manuais" })).toBeTruthy();
        expect(await screen.findByText("Nenhuma localização manual registrada até o momento.")).toBeTruthy();
        expect(getCurrentPosition).not.toHaveBeenCalled();
        fireEvent.click(button);
        expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
        expect(screen.getByRole("status").textContent).toContain("Obtendo localiza\u00e7\u00e3o...");
        expect(button.hasAttribute("disabled")).toBe(true);
        success({ coords: { latitude: -23.55052, longitude: -46.633308, accuracy: 12.4 } as GeolocationCoordinates, timestamp: Date.parse("2026-11-05T18:53:50Z") } as GeolocationPosition);
        await waitFor(() => expect(api).toHaveBeenCalledWith("/api/motorista/minhas-viagens/7/localizacoes/gps", expect.objectContaining({ method: "POST", body: JSON.stringify({ latitude: -23.55052, longitude: -46.633308, accuracy_m: 12.4, captured_at: "2026-11-05T18:53:50.000Z" }) })));
        expect((await screen.findByRole("status")).textContent).toContain("Localiza\u00e7\u00e3o atualizada.");
        expect(screen.getByText("Nenhuma localização manual registrada até o momento.")).toBeTruthy();
        expect(screen.queryByText("Nenhuma localização registrada até o momento.")).toBeNull();
        expect(screen.getByText(/Precis\u00e3o do GPS: 12 m/)).toBeTruthy();
        expect(screen.queryByText(/latitude|longitude|-23\.55052/i)).toBeNull();
    });

    it.each([
        [1, "Permita o acesso"],
        [2, "localiza\u00e7\u00e3o est\u00e1 indispon\u00edvel"],
        [3, "demorou demais"],
    ])("shows a clear geolocation error for code %i", async (code, expected) => {
        let failure!: PositionErrorCallback;
        const getCurrentPosition = vi.fn((_success: PositionCallback, callback: PositionErrorCallback) => { failure = callback; });
        Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
        montar("motorista");
        fireEvent.click(await screen.findByRole("button", { name: "Atualizar localiza\u00e7\u00e3o por GPS" }));
        failure({ code, message: "mock", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
        expect((await screen.findByRole("status")).textContent).toContain(expected);
    });

    it("handles unsupported geolocation and backend failures", async () => {
        Reflect.deleteProperty(navigator, "geolocation");
        montar("motorista");
        fireEvent.click(await screen.findByRole("button", { name: "Atualizar localiza\u00e7\u00e3o por GPS" }));
        expect((await screen.findByRole("status")).textContent).toContain("n\u00e3o oferece suporte");
        expect(api.mock.calls.some(([endpoint]) => endpoint.endsWith("/localizacoes/gps"))).toBe(false);
        cleanup();
        sessionStorage.clear();
        vi.clearAllMocks();
        const getCurrentPosition = vi.fn((success: PositionCallback) => success({ coords: { latitude: 1, longitude: 2, accuracy: 5 } as GeolocationCoordinates, timestamp: Date.parse("2026-11-05T18:53:50Z") } as GeolocationPosition));
        Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
        api.mockImplementation(async (endpoint) => endpoint.endsWith("/localizacoes/gps")
            ? new Response(JSON.stringify({ erro: "Falha GPS simulada" }), { status: 500 })
            : endpoint.endsWith("/localizacoes") ? resposta([])
                : endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos") ? resposta([])
                    : endpoint.endsWith("/comprovante") ? resposta({})
                        : endpoint.endsWith("/7") ? resposta(viagem) : resposta({}));
        montar("motorista");
        fireEvent.click(await screen.findByRole("button", { name: "Atualizar localiza\u00e7\u00e3o por GPS" }));
        expect((await screen.findByRole("status")).textContent).toContain("Falha GPS simulada");
    });

    it("mantém toda a estrutura operacional móvel, comprovantes e timeline", async () => {
        viagem = { ...viagem, status: "Saiu para entrega", destino: "Destino extenso para testar quebra de texto no painel operacional" };
        api.mockImplementation(async (endpoint) => {
            if (endpoint.endsWith("/localizacoes")) return resposta([{ id: 1, localizacao: "Localização extensa", observacao: "Observação longa", data_registro: "05/11/2026 10:00" }]);
            if (endpoint.endsWith("/historico")) return resposta([{ id: 2, status: "LOCALIZAÇÃO", observacao: "Evento operacional extenso", data_evento: "05/11/2026 10:00" }]);
            if (endpoint.endsWith("/comprovantes/arquivos")) return resposta([{ id: 3, nome_arquivo: "comprovante-de-entrega-com-nome-longo.pdf", data_upload: "05/11/2026", download_endpoint: "/api/arquivo/3" }]);
            if (endpoint.endsWith("/comprovante")) return resposta({ recebedor: "Recebedor", data_entrega: "05/11/2026", observacao: "Entregue" });
            if (endpoint.endsWith("/7")) return resposta(viagem);
            throw new Error(`Endpoint inesperado: ${endpoint}`);
        });
        montar("motorista");
        const painel = await screen.findByRole("region", { name: "Rota da viagem" });
        expect(painel.classList.contains("motorista-operacional")).toBe(true);
        expect(document.querySelector("main.motorista-detalhe-layout .detalhe-viagem-motorista")).toBeTruthy();
        expect(within(painel).getByRole("link", { name: /Google Maps/ })).toBeTruthy();
        expect(within(painel).getByRole("link", { name: /Waze/ })).toBeTruthy();
        expect(screen.getByLabelText("Localização atual (manual)")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Registrar localização manual" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Atualizar localização por GPS" })).toBeTruthy();
        expect(screen.getByLabelText("Observação (opcional)")).toBeTruthy();
        expect(screen.getByLabelText("Descreva a ocorrência")).toBeTruthy();
        expect(screen.getByText("comprovante-de-entrega-com-nome-longo.pdf")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Abrir" })).toBeTruthy();
        expect(screen.getByLabelText("Arquivo do comprovante")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Finalizar Entrega" })).toBeTruthy();
        expect(await screen.findByText("Localização extensa")).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Timeline da viagem" })).toBeTruthy();
        expect(screen.getByText("Evento operacional extenso")).toBeTruthy();
        expect(screen.getAllByText("05/11/2026 10:00").length).toBeGreaterThan(0);
        expect(api.mock.calls.every(([, options]) => !options?.method)).toBe(true);
    });

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
        expect(screen.queryByRole("button", { name: "Atualizar localização por GPS" })).toBeNull();
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
        const geolocalizacao = vi.fn();
        Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: geolocalizacao } });
        fireEvent.click(await screen.findByRole("button", { name: "Informar localização manualmente" }));
        expect(document.activeElement?.id).toBe("motorista-localizacao");
        expect(geolocalizacao).not.toHaveBeenCalled();
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
