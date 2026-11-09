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
const viagemBase = { id: 7, codigo_carga: "TRK-TESTE", cliente: "Cliente", motorista: "Motorista", veiculo: "MNO5P67", origem: "São Paulo/SP", destino: "São José dos Campos/SP", status: "Em trânsito", data_criacao: "Hoje", data_saida: "10:00", previsao_entrega: "14:00", estou_chegando: false, data_aviso_chegada: null as string | null };
let viagem = { ...viagemBase };

function resposta(dados: unknown) { return new Response(JSON.stringify(dados), { status: 200, headers: { "Content-Type": "application/json" } }); }
function respostaBaseApi(endpoint: string, options?: RequestInit): Response | null {
    if (endpoint.endsWith("/ocorrencias") && !options?.method) return resposta([]);
    if (endpoint.endsWith("/localizacoes")) return resposta([]);
    if (endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
    if (endpoint.endsWith("/comprovante")) return resposta({});
    if (endpoint.endsWith("/7")) return resposta(viagem);
    return null;
}
function montar(perfil: string) {
    sessionStorage.setItem("usuarioLogado", JSON.stringify({ perfil }));
    const caminho = perfil === "motorista" ? "/portal/motorista/minhas-viagens/7" : "/admin/viagens/7";
    return render(<NotificationProvider><MemoryRouter initialEntries={[caminho]}><Routes><Route path={perfil === "motorista" ? "/portal/motorista/minhas-viagens/:id" : "/admin/viagens/:id"} element={<DetalheViagem />} /></Routes></MemoryRouter></NotificationProvider>);
}

beforeEach(() => {
    viagem = { ...viagemBase };
    api.mockImplementation(async (endpoint, options) => {
        if (endpoint.endsWith("/estou-chegando") && options?.method === "POST") return resposta({ ja_enviado: false, data_aviso: "2026-11-07T13:32:00Z" });
        if (endpoint.endsWith("/status") && options?.method === "POST") {
            viagem = { ...viagem, status: JSON.parse(String(options.body)).status };
            return resposta({ mensagem: "Atualizado" });
        }
        if (endpoint.endsWith("/localizacoes/gps")) return resposta({ mensagem: "Localização atualizada.", data_registro: "2026-11-05T18:53:50Z" });
        const base = respostaBaseApi(endpoint, options);
        if (base) return base;
        throw new Error(`Endpoint inesperado: ${endpoint}`);
    });
});
afterEach(() => { cleanup(); sessionStorage.clear(); vi.clearAllMocks(); });

describe("detalhe operacional do motorista", () => {
    function prepararFotos() {
        const criarUrl = vi.fn((arquivo: File) => `blob:${arquivo.name}`);
        const revogarUrl = vi.fn();
        Object.defineProperty(URL, "createObjectURL", { configurable: true, value: criarUrl });
        Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revogarUrl });
        return { criarUrl, revogarUrl };
    }

    function simularOcorrencia(upload?: () => Promise<Response>) {
        api.mockImplementation(async (endpoint, options) => {
            if (endpoint.endsWith("/ocorrencias/42/fotos") && options?.method === "POST") return upload ? upload() : resposta({ mensagem: "Fotos registradas.", anexos: [], ja_enviado: false });
            if (endpoint.endsWith("/ocorrencias") && options?.method === "POST") return resposta({ mensagem: "Ocorrência registrada!", ocorrencia_id: 42 });
            if (endpoint.endsWith("/ocorrencias") && !options?.method) return resposta([]);
            if (endpoint.endsWith("/localizacoes") || endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            if (endpoint.endsWith("/7")) return resposta(viagem);
            const base = respostaBaseApi(endpoint, options);
            if (base) return base;
            throw new Error(`Endpoint inesperado: ${endpoint}`);
        });
    }

    it("preserva o registro de ocorrência sem foto", async () => {
        viagem = { ...viagem, status: "Em trânsito" };
        simularOcorrencia();
        montar("motorista");
        fireEvent.change(await screen.findByLabelText("Descreva a ocorrência"), { target: { value: "Pneu substituído" } });
        fireEvent.click(screen.getByRole("button", { name: "Registrar Ocorrência" }));
        await waitFor(() => expect(api).toHaveBeenCalledWith("/api/motorista/minhas-viagens/7/ocorrencias", expect.objectContaining({ method: "POST" })));
        expect(api.mock.calls.some(([endpoint]) => endpoint.endsWith("/fotos"))).toBe(false);
    });

    it("seleciona JPEG/PNG, limita a cinco e revoga previews removidos", async () => {
        viagem = { ...viagem, status: "Em trânsito" };
        const { criarUrl, revogarUrl } = prepararFotos();
        simularOcorrencia();
        const tela = montar("motorista");
        const input = await screen.findByLabelText("Adicionar fotos") as HTMLInputElement;
        expect(input.accept).toBe("image/jpeg,image/png");
        expect(input.multiple).toBe(true);
        const jpeg = new File(["a"], "foto.jpg", { type: "image/jpeg" });
        const png = new File(["b"], "foto.png", { type: "image/png" });
        fireEvent.change(input, { target: { files: [jpeg, png] } });
        expect(screen.getByText("2 de 5 fotos")).toBeTruthy();
        expect(screen.getByAltText("Prévia de foto.jpg")).toBeTruthy();
        expect(criarUrl).toHaveBeenCalledTimes(2);
        fireEvent.click(screen.getByRole("button", { name: "Remover foto foto.jpg" }));
        expect(revogarUrl).toHaveBeenCalledWith("blob:foto.jpg");
        expect(screen.getByText("1 de 5 fotos")).toBeTruthy();
        for (const arquivo of [
            new File(["x"], "bad.pdf", { type: "application/pdf" }),
            new File(["x"], "bad.webp", { type: "image/webp" }),
            new File([new Uint8Array(10 * 1024 * 1024 + 1)], "grande.jpg", { type: "image/jpeg" }),
        ]) {
            fireEvent.change(input, { target: { files: [arquivo] } });
            expect(screen.getByRole("alert").textContent).toContain("Foto inválida");
            expect(screen.getByText("1 de 5 fotos")).toBeTruthy();
        }
        fireEvent.change(input, { target: { files: Array.from({ length: 4 }, (_, i) => new File(["x"], `extra${i}.jpg`, { type: "image/jpeg" })) } });
        expect(screen.getByText("5 de 5 fotos")).toBeTruthy();
        fireEvent.change(input, { target: { files: [new File(["x"], "sexta.jpg", { type: "image/jpeg" })] } });
        expect(screen.getByRole("alert").textContent).toContain("no máximo 5");
        tela.unmount();
        expect(revogarUrl).toHaveBeenCalledWith("blob:foto.png");
    });

    it("cria ocorrência antes do upload e limpa previews após sucesso", async () => {
        viagem = { ...viagem, status: "Saiu para entrega" };
        const { revogarUrl } = prepararFotos();
        simularOcorrencia();
        const gps = vi.fn();
        Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: gps } });
        montar("motorista");
        fireEvent.change(await screen.findByLabelText("Descreva a ocorrência"), { target: { value: "Parada breve" } });
        fireEvent.change(screen.getByLabelText("Adicionar fotos"), { target: { files: [new File(["a"], "foto.jpg", { type: "image/jpeg" })] } });
        fireEvent.click(screen.getByRole("button", { name: "Registrar Ocorrência" }));
        await waitFor(() => expect(api.mock.calls.some(([endpoint]) => endpoint.endsWith("/ocorrencias/42/fotos"))).toBe(true));
        const escritas = api.mock.calls.filter(([endpoint, options]) =>
            (endpoint === "/api/motorista/minhas-viagens/7/ocorrencias" || endpoint === "/api/motorista/minhas-viagens/7/ocorrencias/42/fotos") &&
            options?.method === "POST"
        );
        expect(escritas.map(([endpoint]) => endpoint)).toEqual(["/api/motorista/minhas-viagens/7/ocorrencias", "/api/motorista/minhas-viagens/7/ocorrencias/42/fotos"]);
        const corpo = escritas[1][1]?.body as FormData;
        expect(corpo.getAll("fotos")).toHaveLength(1);
        expect(await screen.findByText("Ocorrência registrada. Fotos anexadas.")).toBeTruthy();
        expect(screen.getByText("0 de 5 fotos")).toBeTruthy();
        expect(revogarUrl).toHaveBeenCalledWith("blob:foto.jpg");
        expect(gps).not.toHaveBeenCalled();
        expect(screen.getByText("Status atual: Saiu para entrega")).toBeTruthy();
    });

    it("recupera falha parcial reenviando somente as fotos e bloqueia duplo clique", async () => {
        viagem = { ...viagem, status: "Saiu para entrega" };
        prepararFotos();
        let resolverCriacao!: (value: Response) => void;
        let uploads = 0;
        api.mockImplementation(async (endpoint, options) => {
            if (endpoint.endsWith("/ocorrencias") && options?.method === "POST") return new Promise<Response>((resolve) => { resolverCriacao = resolve; });
            if (endpoint.endsWith("/ocorrencias") && !options?.method) return resposta([]);
            if (endpoint.endsWith("/ocorrencias/42/fotos") && options?.method === "POST") return ++uploads === 1
                ? new Response(JSON.stringify({ erro: "Falha simulada" }), { status: 500 })
                : resposta({ mensagem: "Fotos registradas.", anexos: [], ja_enviado: false });
            if (endpoint.endsWith("/localizacoes") || endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            if (endpoint.endsWith("/7")) return resposta(viagem);
            const base = respostaBaseApi(endpoint, options);
            if (base) return base;
            throw new Error(endpoint);
        });
        montar("motorista");
        fireEvent.change(await screen.findByLabelText("Descreva a ocorrência"), { target: { value: "Atraso" } });
        fireEvent.change(screen.getByLabelText("Adicionar fotos"), { target: { files: [new File(["a"], "foto.png", { type: "image/png" })] } });
        fireEvent.click(screen.getByRole("button", { name: "Registrar Ocorrência" }));
        expect(screen.getByRole("button", { name: "Registrando ocorrência..." }).hasAttribute("disabled")).toBe(true);
        fireEvent.click(screen.getByRole("button", { name: "Registrando ocorrência..." }));
        expect(api.mock.calls.filter(([endpoint, options]) => endpoint === "/api/motorista/minhas-viagens/7/ocorrencias" && options?.method === "POST")).toHaveLength(1);
        resolverCriacao(resposta({ mensagem: "Ocorrência registrada!", ocorrencia_id: 42 }));
        expect((await screen.findByRole("alert")).textContent).toContain("Ocorrência registrada, mas não foi possível enviar as fotos");
        expect(screen.getByText("1 de 5 fotos")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Tentar enviar fotos novamente" }));
        expect(await screen.findByText("Ocorrência registrada. Fotos anexadas.")).toBeTruthy();
        expect(api.mock.calls.filter(([endpoint, options]) => endpoint === "/api/motorista/minhas-viagens/7/ocorrencias" && options?.method === "POST")).toHaveLength(1);
        expect(api.mock.calls.filter(([endpoint]) => endpoint.endsWith("/ocorrencias/42/fotos"))).toHaveLength(2);
    });

    it("não tenta enviar fotos quando criar a ocorrência falha", async () => {
        viagem = { ...viagem, status: "Em trânsito" };
        prepararFotos();
        simularOcorrencia();
        api.mockImplementation(async (endpoint, options) => {
            if (endpoint.endsWith("/ocorrencias") && options?.method === "POST") return new Response(JSON.stringify({ erro: "Falha na ocorrência" }), { status: 500 });
            if (endpoint.endsWith("/ocorrencias") && !options?.method) return resposta([]);
            if (endpoint.endsWith("/localizacoes") || endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            if (endpoint.endsWith("/7")) return resposta(viagem);
            const base = respostaBaseApi(endpoint, options);
            if (base) return base;
            throw new Error(endpoint);
        });
        montar("motorista");
        fireEvent.change(await screen.findByLabelText("Descreva a ocorrência"), { target: { value: "Atraso" } });
        fireEvent.change(screen.getByLabelText("Adicionar fotos"), { target: { files: [new File(["a"], "foto.jpg", { type: "image/jpeg" })] } });
        fireEvent.click(screen.getByRole("button", { name: "Registrar Ocorrência" }));
        await waitFor(() => expect(api.mock.calls.some(([endpoint]) => endpoint.endsWith("/ocorrencias"))).toBe(true));
        expect(api.mock.calls.some(([endpoint]) => endpoint.endsWith("/fotos"))).toBe(false);
    });
    it.each(["Em trânsito", "Entregue"])("não oferece aviso em %s", async (status) => {
        viagem = { ...viagem, status };
        montar("motorista");
        await screen.findByRole("region", { name: "Rota da viagem" });
        expect(screen.queryByRole("button", { name: "Estou chegando" })).toBeNull();
    });

    it("mantém o aviso enviado após carregar o detalhe novamente", async () => {
        viagem = { ...viagem, status: "Saiu para entrega", estou_chegando: true, data_aviso_chegada: "2026-11-07T13:32:00Z" };
        const tela = montar("motorista");
        expect(await screen.findByText("✓ Cliente avisado às 10:32")).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Estou chegando" })).toBeNull();
        tela.unmount();
        montar("motorista");
        expect(await screen.findByText("✓ Cliente avisado às 10:32")).toBeTruthy();
    });

    it.each([false, true])("envia aviso e aceita resposta idempotente=%s sem GPS nem mudar status", async (ja_enviado) => {
        viagem = { ...viagem, status: "Saiu para entrega" };
        let concluir!: (value: Response) => void;
        api.mockImplementation(async (endpoint, options) => {
            if (endpoint.endsWith("/estou-chegando") && options?.method === "POST") return new Promise<Response>((resolve) => { concluir = resolve; });
            if (endpoint.endsWith("/ocorrencias") && !options?.method) return resposta([]);
            if (endpoint.endsWith("/localizacoes") || endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            if (endpoint.endsWith("/7")) return resposta(viagem);
            const base = respostaBaseApi(endpoint, options);
            if (base) return base;
            throw new Error(endpoint);
        });
        const gps = vi.fn();
        Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: gps } });
        montar("motorista");
        const botao = await screen.findByRole("button", { name: "Estou chegando" });
        fireEvent.click(botao);
        expect(screen.getByRole("button", { name: "Enviando aviso..." }).hasAttribute("disabled")).toBe(true);
        fireEvent.click(screen.getByRole("button", { name: "Enviando aviso..." }));
        expect(api.mock.calls.filter(([endpoint]) => endpoint.endsWith("/estou-chegando"))).toHaveLength(1);
        concluir(resposta({ ja_enviado, data_aviso: "2026-11-07T13:32:00Z" }));
        expect(await screen.findByText("✓ Cliente avisado às 10:32")).toBeTruthy();
        expect(screen.getByText("Status atual: Saiu para entrega")).toBeTruthy();
        expect(api).toHaveBeenCalledWith("/api/motorista/minhas-viagens/7/estou-chegando", { method: "POST" });
        expect(gps).not.toHaveBeenCalled();
        expect(api.mock.calls.some(([endpoint]) => endpoint.endsWith("/status") || endpoint.endsWith("/finalizar"))).toBe(false);
    });

    it("mostra erro e permite tentar o aviso novamente", async () => {
        viagem = { ...viagem, status: "Saiu para entrega" };
        let tentativas = 0;
        api.mockImplementation(async (endpoint, options) => {
            if (endpoint.endsWith("/estou-chegando") && options?.method === "POST") {
                tentativas++;
                return tentativas === 1 ? new Response(JSON.stringify({ erro: "Aviso indisponível" }), { status: 500 }) : resposta({ data_aviso: "2026-11-07T13:32:00Z" });
            }
            if (endpoint.endsWith("/ocorrencias") && !options?.method) return resposta([]);
            if (endpoint.endsWith("/localizacoes") || endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            if (endpoint.endsWith("/7")) return resposta(viagem);
            throw new Error(endpoint);
        });
        montar("motorista");
        fireEvent.click(await screen.findByRole("button", { name: "Estou chegando" }));
        expect((await screen.findByRole("alert")).textContent).toContain("Aviso indisponível");
        fireEvent.click(screen.getByRole("button", { name: "Estou chegando" }));
        expect(await screen.findByText("✓ Cliente avisado às 10:32")).toBeTruthy();
        expect(tentativas).toBe(2);
    });
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
            : endpoint.endsWith("/ocorrencias") ? resposta([])
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
            if (endpoint.endsWith("/ocorrencias")) return resposta([]);
            if (endpoint.endsWith("/localizacoes")) return resposta([{ id: 1, localizacao: "Localização extensa", observacao: "Observação longa", data_registro: "05/11/2026 10:00" }]);
            if (endpoint.endsWith("/historico")) return resposta([{ id: 2, status: "LOCALIZAÇÃO", observacao: "Evento operacional extenso", data_evento: "05/11/2026 10:00" }]);
            if (endpoint.endsWith("/comprovantes/arquivos")) return resposta([{ id: 3, nome_arquivo: "comprovante-de-entrega-com-nome-longo.pdf", data_upload: "05/11/2026", download_endpoint: "/api/arquivo/3" }]);
            if (endpoint.endsWith("/comprovante")) return resposta({ recebedor: "Recebedor", data_entrega: "05/11/2026", observacao: "Entregue" });
            if (endpoint.endsWith("/7")) return resposta(viagem);
            const base = respostaBaseApi(endpoint, options);
            if (base) return base;
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

    it("carrega fotos persistidas da ocorrência após atualizar a página", async () => {
        viagem = { ...viagem, status: "Saiu para entrega" };
        const criarUrl = vi.fn(() => "blob:foto-persistida");
        const revogarUrl = vi.fn();
        Object.defineProperty(URL, "createObjectURL", { configurable: true, value: criarUrl });
        Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revogarUrl });
        api.mockImplementation(async (endpoint, options) => {
            if (endpoint === "/api/motorista/minhas-viagens/7/ocorrencias" && !options?.method) return resposta([{ id: 1, descricao: "Embalagem danificada", data: "08/11/2026 08:45", data_iso: "2026-11-08T11:45:47Z" }]);
            if (endpoint === "/api/motorista/minhas-viagens/7/ocorrencias/1/fotos" && !options?.method) return resposta([{ id: 9, ocorrencia_id: 1, nome_original: "garrafa-inox_2.png", mime_type: "image/png", tamanho_bytes: 58494, data_upload: "2026-11-08T11:45:47Z", download_endpoint: "/api/ocorrencias/fotos/9/download" }]);
            if (endpoint === "/api/ocorrencias/fotos/9/download" && !options?.method) {
                const downloadBlob = new Blob(["png"], { type: "image/png" });
                return { ok: true, status: 200, blob: async () => downloadBlob } as Response;
            }
            if (endpoint.endsWith("/localizacoes") || endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            if (endpoint.endsWith("/7")) return resposta(viagem);
            throw new Error(endpoint);
        });
        const tela = montar("motorista");
        expect(await screen.findByRole("heading", { name: "Fotos da ocorrência" })).toBeTruthy();
        expect(screen.getByText("08/11/2026, 08:45")).toBeTruthy();
        const imagem = screen.getByAltText("Foto da ocorrência: garrafa-inox_2.png") as HTMLImageElement;
        expect(imagem.getAttribute("src")).toBe("blob:foto-persistida");
        expect(api.mock.calls.some(([endpoint]) => endpoint.endsWith("/ocorrencias/1/fotos"))).toBe(true);
        expect(api.mock.calls.some(([endpoint]) => endpoint.endsWith("/ocorrencias/fotos/9/download"))).toBe(true);
        tela.unmount();
        expect(revogarUrl).toHaveBeenCalledWith("blob:foto-persistida");
    });

    it("mantém a tela funcional quando uma foto persistida não pode ser baixada", async () => {
        api.mockImplementation(async (endpoint, options) => {
            if (endpoint === "/api/motorista/minhas-viagens/7/ocorrencias" && !options?.method) return resposta([{ id: 1, descricao: "Ocorrência sem download", data: "08/11/2026 08:45", data_iso: "2026-11-08T08:45:00Z" }]);
            if (endpoint === "/api/motorista/minhas-viagens/7/ocorrencias/1/fotos" && !options?.method) return resposta([{ id: 9, ocorrencia_id: 1, nome_original: "falha.png", mime_type: "image/png", tamanho_bytes: 10, data_upload: "2026-11-08T11:45:47Z", download_endpoint: "/api/ocorrencias/fotos/9/download" }]);
            if (endpoint === "/api/ocorrencias/fotos/9/download" && !options?.method) return new Response("Negado", { status: 403 });
            if (endpoint.endsWith("/localizacoes") || endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            if (endpoint.endsWith("/7")) return resposta(viagem);
            throw new Error(endpoint);
        });
        montar("motorista");
        expect(await screen.findByRole("region", { name: "Rota da viagem" })).toBeTruthy();
        expect(screen.queryByAltText("Foto da ocorrência: falha.png")).toBeNull();
    });
});
