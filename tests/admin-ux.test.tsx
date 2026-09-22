import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { NotificationProvider, useNotification } from "../src/components/ui/NotificationProvider";
import { apiFetch } from "../src/services/api";
import { abrirArquivoAutenticado } from "../src/services/arquivosService";
import NovoCliente from "../src/pages/NovoCliente";
import NovoUsuario from "../src/pages/NovoUsuario";
import NovoMotorista from "../src/pages/NovoMotorista";
import NovoVeiculo from "../src/pages/NovoVeiculo";
import NovaCarga from "../src/pages/NovaCarga";
import AdminClientes from "../src/pages/AdminClientes";
import AdminUsuarios from "../src/pages/AdminUsuarios";
import AdminMotoristas from "../src/pages/AdminMotoristas";
import AdminVeiculos from "../src/pages/AdminVeiculos";
import AdminCargas from "../src/pages/AdminCargas";
import DetalheViagem from "../src/pages/DetalheViagem";
import ListaComprovantes from "../src/components/admin/ListaComprovantes";

vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }));
vi.mock("../src/services/arquivosService", () => ({ abrirArquivoAutenticado: vi.fn() }));
vi.mock("../src/components/admin/AdminLayout", () => ({
    default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock("../src/components/admin/RastreamentoViagem", () => ({ default: () => null }));

const api = vi.mocked(apiFetch);
const cliente = { id: 1, razao_social: "Cliente HML", nome_fantasia: "HML", ativo: true };
const usuario = { id: 2, nome: "Usuário HML", usuario: "usuario-hml", email: "teste@example.invalid", perfil: "operador", ativo: true, data_criacao: "21/09/2026" };
const motorista = { id: 3, nome: "Motorista HML", status: "Ativo", disponibilidade: "Disponível" };
const veiculo = { id: 4, placa: "HML1A23", modelo: "Sintético", status: "Disponível" };
const carga = { id: 5, codigo: "HML-CARGA", cliente: "Cliente HML", status: "Pendente", destino: "Destino HML" };
const viagem = { id: 7, codigo_carga: "HML-VIAGEM", cliente: "Cliente HML", status: "Saiu para entrega" };
const arquivo = { id: 8, nome_arquivo: "comprovante-hml.pdf", data_upload: "21/09/2026", download_endpoint: "/api/comprovantes/8/download" };

function resposta(dados: unknown, status = 200) {
    return new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json" } });
}

function leitura(endpoint: string) {
    const dados: Record<string, unknown> = {
        "/api/admin/clientes": [cliente],
        "/api/admin/usuarios": [usuario],
        "/api/admin/motoristas": [motorista],
        "/api/admin/veiculos": [veiculo],
        "/api/admin/cargas": [carga],
        "/api/admin/viagens/7": viagem,
        "/api/admin/viagens/7/historico": [],
        "/api/admin/viagens/7/comprovante": {},
        "/api/admin/viagens/7/comprovantes/arquivos": [],
    };
    if (!(endpoint in dados)) throw new Error(`Consulta simulada não definida: ${endpoint}`);
    return resposta(dados[endpoint]);
}

function Localizacao() {
    return <output data-testid="rota">{useLocation().pathname}</output>;
}

function montar(pagina: ReactNode, caminho = "/novo", destino?: { caminho: string; pagina: ReactNode }) {
    return render(
        <NotificationProvider>
            <MemoryRouter initialEntries={[caminho]}>
                <Localizacao />
                <Routes>
                    <Route path={caminho.includes("/viagens/") ? "/admin/viagens/:id" : caminho} element={pagina} />
                    {destino && <Route path={destino.caminho} element={destino.pagina} />}
                </Routes>
            </MemoryRouter>
        </NotificationProvider>
    );
}

beforeEach(() => {
    sessionStorage.setItem("usuarioLogado", JSON.stringify({ perfil: "administrador" }));
    api.mockImplementation(async (endpoint) => leitura(endpoint));
    vi.spyOn(window, "alert").mockImplementation(() => { throw new Error("alert nativo inesperado"); });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Rede real proibida nestes testes"); }));
});

afterEach(() => {
    expect(window.alert).not.toHaveBeenCalled();
    cleanup();
    sessionStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

const cadastros = [
    { nome: "cliente", pagina: <NovoCliente />, lista: <AdminClientes />, destino: "/admin/clientes", endpoint: "/api/admin/clientes", mensagem: "Cliente cadastrado com sucesso!", item: "Cliente HML" },
    { nome: "usuário", pagina: <NovoUsuario />, lista: <AdminUsuarios />, destino: "/admin/usuarios", endpoint: "/api/admin/usuarios", mensagem: "Usuário criado com sucesso!", item: "Usuário HML" },
    { nome: "motorista", pagina: <NovoMotorista />, lista: <AdminMotoristas />, destino: "/admin/motoristas", endpoint: "/api/admin/motoristas", mensagem: "Motorista cadastrado com sucesso!", item: "Motorista HML" },
    { nome: "veículo", pagina: <NovoVeiculo />, lista: <AdminVeiculos />, destino: "/admin/veiculos", endpoint: "/api/admin/veiculos", mensagem: "Veículo cadastrado com sucesso!", item: "HML1A23" },
    { nome: "carga", pagina: <NovaCarga />, lista: <AdminCargas />, destino: "/admin/cargas", endpoint: "/api/admin/cargas", mensagem: "Carga cadastrada com sucesso!", item: "HML-CARGA" },
];

describe.each(cadastros)("Cadastro de $nome", (caso) => {
    it("mostra toast na listagem e consulta a lista após o cadastro", async () => {
        let criado = false;
        api.mockImplementation(async (endpoint, opcoes) => {
            if (endpoint === caso.endpoint && opcoes?.method === "POST") {
                criado = true;
                return resposta({ mensagem: "Sucesso da API" }, 201);
            }
            // Clientes ativos podem ser consultados antes para preencher os selects.
            if (endpoint === caso.endpoint && !criado) return resposta([]);
            return leitura(endpoint);
        });
        const { container } = montar(caso.pagina, "/novo", { caminho: caso.destino, pagina: caso.lista });
        await act(async () => { fireEvent.submit(container.querySelector("form")!); });
        await waitFor(() => expect(screen.getByTestId("rota").textContent).toBe(caso.destino));
        expect(screen.getByText(caso.mensagem).closest("[role=status]")?.className).toContain("notificacao-sucesso");
        expect(await screen.findByText(caso.item)).toBeTruthy();
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it("mantém formulário e mensagem do backend quando o cadastro falha", async () => {
        api.mockImplementation(async (endpoint, opcoes) => opcoes?.method === "POST"
            ? resposta({ erro: "Cadastro recusado pelo backend." }, 400)
            : leitura(endpoint));
        const { container } = montar(caso.pagina);
        await act(async () => { fireEvent.submit(container.querySelector("form")!); });
        expect(await screen.findByText("Cadastro recusado pelo backend.")).toBeTruthy();
        expect(screen.getByRole("alert").className).toContain("notificacao-erro");
        expect(screen.getByTestId("rota").textContent).toBe("/novo");
        expect(screen.queryByText(caso.mensagem)).toBeNull();
    });
});

describe.each([
    { nome: "Clientes", pagina: <AdminClientes />, item: "Cliente HML" },
    { nome: "Veículos", pagina: <AdminVeiculos />, item: "HML1A23" },
    { nome: "Motoristas", pagina: <AdminMotoristas />, item: "Motorista HML" },
])("Permissão visual em $nome", ({ pagina, item }) => {
    it.each(["operador", "administrador"])("respeita o perfil %s", async (perfil) => {
        sessionStorage.setItem("usuarioLogado", JSON.stringify({ perfil }));
        montar(pagina);
        await screen.findByText(item);
        expect(screen.queryByRole("button", { name: "Inativar" }) !== null).toBe(perfil === "administrador");
    });
});

describe.each([
    { nome: "veículo", pagina: <AdminVeiculos />, item: "HML1A23" },
    { nome: "motorista", pagina: <AdminMotoristas />, item: "Motorista HML" },
])("Recurso ocupado: $nome", ({ pagina, item }) => {
    it.each([403, 409])("mostra aviso temporário com mensagem do backend para HTTP %s", async (status) => {
        const mensagem = "Não é possível inativar enquanto houver viagem ou carga ativa.";
        api.mockImplementation(async (endpoint, opcoes) => opcoes?.method === "PUT" ? resposta({ erro: mensagem }, status) : leitura(endpoint));
        montar(pagina);
        await screen.findByText(item);
        fireEvent.click(screen.getByRole("button", { name: "Inativar" }));
        expect((await screen.findByText(mensagem)).closest("[role=status]")?.className).toContain("notificacao-aviso");
        expect(window.confirm).toHaveBeenCalledTimes(1);
    });
});

describe("Exclusão de carga", () => {
    it.each([true, false])("preserva a confirmação prévia (confirma=%s)", async (confirma) => {
        vi.mocked(window.confirm).mockReturnValue(confirma);
        api.mockImplementation(async (endpoint, opcoes) => opcoes?.method === "DELETE" ? resposta({ mensagem: "Excluída" }) : leitura(endpoint));
        montar(<AdminCargas />);
        await screen.findByText("HML-CARGA");
        await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Excluir" })); });
        expect(api.mock.calls.some(([, opcoes]) => opcoes?.method === "DELETE")).toBe(confirma);
        if (confirma) {
            expect(screen.getByText("Carga excluída com sucesso!")).toBeTruthy();
            expect(screen.queryByText("HML-CARGA")).toBeNull();
        } else {
            expect(screen.getByText("HML-CARGA")).toBeTruthy();
        }
    });

    it("exibe a negativa do backend sem segundo diálogo e preserva a carga", async () => {
        api.mockImplementation(async (endpoint, opcoes) => opcoes?.method === "DELETE"
            ? resposta({ erro: "Carga possui viagem vinculada." }, 409) : leitura(endpoint));
        montar(<AdminCargas />);
        await screen.findByText("HML-CARGA");
        fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
        expect(await screen.findByText("Carga possui viagem vinculada.")).toBeTruthy();
        expect(screen.getByRole("alert").className).toContain("notificacao-erro");
        expect(screen.getByText("HML-CARGA")).toBeTruthy();
        expect(window.confirm).toHaveBeenCalledTimes(1);
    });
});

describe("Viagem e comprovantes", () => {
    it("confirma ocorrência e atualiza a timeline sem navegar", async () => {
        let registrada = false;
        api.mockImplementation(async (endpoint, opcoes) => {
            if (endpoint.endsWith("/ocorrencias") && opcoes?.method === "POST") {
                registrada = true;
                return resposta({ mensagem: "Registrada" }, 201);
            }
            if (endpoint.endsWith("/historico") && registrada) return resposta([{ id: 1, status: "Ocorrência", observacao: "Ocorrência HML" }]);
            return leitura(endpoint);
        });
        montar(<DetalheViagem />, "/admin/viagens/7");
        const descricao = await screen.findByPlaceholderText("Registrar ocorrência...");
        fireEvent.change(descricao, { target: { value: "Ocorrência HML" } });
        fireEvent.click(screen.getByRole("button", { name: "Registrar Ocorrência" }));
        expect(await screen.findByText("Ocorrência registrada com sucesso!")).toBeTruthy();
        expect(await screen.findByText("Ocorrência HML")).toBeTruthy();
        expect((descricao as HTMLTextAreaElement).value).toBe("");
        expect(screen.getByTestId("rota").textContent).toBe("/admin/viagens/7");
    });

    it("atualiza comprovantes e timeline após upload e mantém download autenticado", async () => {
        let enviado = false;
        api.mockImplementation(async (endpoint, opcoes) => {
            if (endpoint.endsWith("/comprovante/arquivo") && opcoes?.method === "POST") {
                expect(opcoes.body).toBeInstanceOf(FormData);
                enviado = true;
                return resposta({ mensagem: "Enviado" }, 201);
            }
            if (endpoint.endsWith("/comprovantes/arquivos") && enviado) return resposta([arquivo]);
            if (endpoint.endsWith("/historico") && enviado) return resposta([{ id: 9, status: "Comprovante anexado", observacao: "Upload HML" }]);
            return leitura(endpoint);
        });
        montar(<DetalheViagem />, "/admin/viagens/7");
        const input = await screen.findByLabelText("Arquivo do comprovante");
        fireEvent.change(input, { target: { files: [new File(["%PDF-1.4\nHML"], "comprovante-hml.pdf", { type: "application/pdf" })] } });
        fireEvent.click(screen.getByRole("button", { name: "Enviar Arquivo" }));
        expect(await screen.findByText("Arquivo do comprovante enviado com sucesso!")).toBeTruthy();
        expect(await screen.findByText(arquivo.nome_arquivo)).toBeTruthy();
        expect(screen.getByLabelText("Arquivo do comprovante")).toBe(input);
        expect(
            api.mock.calls.filter(([endpoint]) =>
                endpoint.endsWith("/comprovantes/arquivos")
            )
        ).toHaveLength(2);
        expect(await screen.findByText("Upload HML")).toBeTruthy();
        expect(screen.getByTestId("rota").textContent).toBe("/admin/viagens/7");
        expect((input as HTMLInputElement).value).toBe("");
        expect((screen.getByRole("button", { name: "Enviar Arquivo" }) as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
        expect(abrirArquivoAutenticado).toHaveBeenCalledWith(arquivo.download_endpoint);
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it.each([400, 413, 429])("mantém a rejeição HTTP %s do upload em toast e não insere arquivo", async (status) => {
        api.mockImplementation(async (endpoint, opcoes) => opcoes?.method === "POST"
            ? resposta({ erro: "Upload recusado pelo backend." }, status) : leitura(endpoint));
        montar(<DetalheViagem />, "/admin/viagens/7");
        fireEvent.change(await screen.findByLabelText("Arquivo do comprovante"), { target: { files: [new File(["HML"], "hml.pdf")] } });
        fireEvent.click(screen.getByRole("button", { name: "Enviar Arquivo" }));
        expect(await screen.findByText("Upload recusado pelo backend.")).toBeTruthy();
        expect(screen.queryByText("Arquivo do comprovante enviado com sucesso!")).toBeNull();
        expect(screen.getByText("Nenhum arquivo enviado.")).toBeTruthy();
    });

    it("mantém confirmação antes da finalização", async () => {
        vi.mocked(window.confirm).mockReturnValue(false);
        montar(<DetalheViagem />, "/admin/viagens/7");
        fireEvent.change(await screen.findByLabelText("Nome do recebedor"), { target: { value: "Recebedor HML" } });
        fireEvent.click(screen.getByRole("button", { name: "Finalizar Entrega" }));
        expect(window.confirm).toHaveBeenCalledTimes(1);
        expect(api.mock.calls.some(([, opcoes]) => opcoes?.method === "POST")).toBe(false);
    });

    it("descarta resposta antiga da lista que chega depois da atualização do upload", async () => {
        const { rerender } = render(<NotificationProvider><ListaComprovantes arquivos={[]} /></NotificationProvider>);
        rerender(<NotificationProvider><ListaComprovantes arquivos={[arquivo]} /></NotificationProvider>);
        expect(await screen.findByText(arquivo.nome_arquivo)).toBeTruthy();
    });
});

it("toasts de todas as severidades desaparecem automaticamente em quatro segundos", () => {
    vi.useFakeTimers();
    function Disparar() {
        const { notificar } = useNotification();
        return <button onClick={() => {
            for (const tipo of ["sucesso", "erro", "aviso", "informacao"] as const) notificar(tipo, `Mensagem ${tipo}`);
        }}>Notificar</button>;
    }
    render(<NotificationProvider><Disparar /></NotificationProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Notificar" }));
    expect(screen.getAllByText(/^Mensagem /)).toHaveLength(4);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.queryAllByText(/^Mensagem /)).toHaveLength(0);
});
