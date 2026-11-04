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
import NovaViagem from "../src/pages/NovaViagem";
import AdminClientes from "../src/pages/AdminClientes";
import AdminUsuarios from "../src/pages/AdminUsuarios";
import AdminMotoristas from "../src/pages/AdminMotoristas";
import AdminVeiculos from "../src/pages/AdminVeiculos";
import AdminCargas from "../src/pages/AdminCargas";
import AdminViagens from "../src/pages/AdminViagens";
import DetalheViagem from "../src/pages/DetalheViagem";
import CargaDetalhe from "../src/pages/CargaDetalhe";
import DetalheCargaCliente from "../src/pages/DetalheCargaCliente";
import { transicoesCarga, transicoesViagem } from "../src/constants/estadosOperacionais";
import { buscarDetalheCarga, listarComprovantesCarga, listarOcorrenciasCarga } from "../src/services/clienteService";
import ListaComprovantes from "../src/components/admin/ListaComprovantes";

vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }));
vi.mock("../src/services/arquivosService", () => ({ abrirArquivoAutenticado: vi.fn() }));
vi.mock("../src/services/clienteService", () => ({
    buscarDetalheCarga: vi.fn(),
    criarOcorrenciaCarga: vi.fn(),
    listarOcorrenciasCarga: vi.fn(),
    listarComprovantesCarga: vi.fn(),
}));
vi.mock("../src/components/admin/AdminLayout", () => ({
    default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock("../src/components/admin/RastreamentoViagem", () => ({ default: () => null }));

const api = vi.mocked(apiFetch);
const buscarCargaCliente = vi.mocked(buscarDetalheCarga);
const listarOcorrenciasCliente = vi.mocked(listarOcorrenciasCarga);
const listarComprovantesCliente = vi.mocked(listarComprovantesCarga);
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
                    <Route path={caminho.includes("/viagens/") ? (caminho.startsWith("/portal/") ? "/portal/motorista/minhas-viagens/:id" : "/admin/viagens/:id") : caminho.startsWith("/portal/cliente/minhas-cargas/") ? "/portal/cliente/minhas-cargas/:id" : caminho.includes("/cargas/") && !caminho.endsWith("/nova") ? "/admin/cargas/:id" : caminho} element={pagina} />
                    {destino && <Route path={destino.caminho} element={destino.pagina} />}
                </Routes>
            </MemoryRouter>
        </NotificationProvider>
    );
}

beforeEach(() => {
    sessionStorage.setItem("usuarioLogado", JSON.stringify({ perfil: "administrador" }));
    api.mockImplementation(async (endpoint) => leitura(endpoint));
    buscarCargaCliente.mockResolvedValue({ id: 5, codigo: "HML-CARGA", cliente: "Cliente HML", status: "Em trânsito", local_atual: "Origem", destino: "Destino", ultima_atualizacao: "Agora", historico: [] });
    listarOcorrenciasCliente.mockResolvedValue([]);
    listarComprovantesCliente.mockResolvedValue({ comprovantes: [], arquivos: [] } as never);
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

    if (caso.nome === "carga") {
        it("renderiza e envia os novos dados operacionais opcionais", async () => {
            api.mockImplementation(async (endpoint, opcoes) => endpoint === "/api/admin/cargas" && opcoes?.method === "POST"
                ? resposta({ mensagem: "Sucesso da API" }, 201)
                : endpoint === "/api/admin/clientes" ? resposta([cliente]) : leitura(endpoint));
            montar(<NovaCarga />, "/admin/cargas/nova");
            fireEvent.change(await screen.findByLabelText("Cliente"), { target: { value: "1" } });
            fireEvent.change(screen.getByLabelText("Descrição da carga"), { target: { value: "Alimentos embalados" } });
            fireEvent.change(screen.getByLabelText("Peso da carga (kg)"), { target: { value: "125.5" } });
            fireEvent.change(screen.getByLabelText("Saída prevista"), { target: { value: "2026-11-05T17:30" } });
            fireEvent.change(screen.getByLabelText("Previsão de entrega"), { target: { value: "2026-11-06T09:15" } });
            fireEvent.change(document.querySelector<HTMLInputElement>('input[name="local_atual"]')!, { target: { value: "Origem" } });
            fireEvent.change(document.querySelector<HTMLInputElement>('input[name="destino"]')!, { target: { value: "Destino" } });
            fireEvent.submit(screen.getByRole("button", { name: "Salvar Carga" }).closest("form")!);
            await waitFor(() => expect(api).toHaveBeenCalledWith("/api/admin/cargas", expect.objectContaining({
                method: "POST",
                body: expect.stringContaining('"data_prevista_saida":"2026-11-05T17:30"'),
            })));
            const payload = JSON.parse((api.mock.calls.find(([url, options]) => url === "/api/admin/cargas" && options?.method === "POST")?.[1]?.body as string));
            expect(payload).toMatchObject({ descricao_carga: "Alimentos embalados", peso_kg: "125.5", previsao_entrega: "2026-11-06T09:15" });
        });
    }
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

    it("cancela a confirma\u00e7\u00e3o visual sem finalizar a entrega", async () => {
        montar(<DetalheViagem />, "/admin/viagens/7");
        fireEvent.change(await screen.findByLabelText("Nome do recebedor"), { target: { value: "Recebedor HML" } });
        fireEvent.click(screen.getByRole("button", { name: "Finalizar Entrega" }));
        expect(screen.getByRole("dialog").textContent).toContain("Deseja realmente finalizar esta entrega? O motorista e o ve\u00edculo ser\u00e3o liberados.");
        fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(api.mock.calls.some(([, opcoes]) => opcoes?.method === "POST")).toBe(false);
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it("confirma a entrega usando o fluxo de finaliza\u00e7\u00e3o existente", async () => {
        montar(<DetalheViagem />, "/admin/viagens/7");
        fireEvent.change(await screen.findByLabelText("Nome do recebedor"), { target: { value: "Recebedor HML" } });
        fireEvent.change(screen.getByLabelText("Observa\u00e7\u00f5es"), { target: { value: "Entregue na recep\u00e7\u00e3o" } });
        fireEvent.click(screen.getByRole("button", { name: "Finalizar Entrega" }));
        fireEvent.click(screen.getByRole("button", { name: "Confirmar entrega" }));
        await waitFor(() => expect(api).toHaveBeenCalledWith("/api/admin/viagens/7/finalizar", expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ recebedor: "Recebedor HML", observacao: "Entregue na recep\u00e7\u00e3o" }),
        })));
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it("descarta resposta antiga da lista que chega depois da atualização do upload", async () => {
        const { rerender } = render(<NotificationProvider><ListaComprovantes arquivos={[]} /></NotificationProvider>);
        rerender(<NotificationProvider><ListaComprovantes arquivos={[arquivo]} /></NotificationProvider>);
        expect(await screen.findByText(arquivo.nome_arquivo)).toBeTruthy();
    });
});

describe("transições de status operacionais", () => {
    async function opcoesCarga(status: string) {
        api.mockImplementation(async (endpoint) => endpoint === "/api/admin/cargas/5"
            ? resposta({ ...carga, status, local_atual: "Origem", ultima_atualizacao: "Agora", motorista_id: null, motorista: "", veiculo_id: null, veiculo: "", viagem_id: null })
            : endpoint === "/api/admin/motoristas" || endpoint === "/api/admin/veiculos"
                ? resposta([])
                : leitura(endpoint));
        montar(<CargaDetalhe />, "/admin/cargas/5");
        await screen.findByText("Atualizar status");
        const seletor = document.querySelector<HTMLSelectElement>("#status-carga");
        expect(seletor).not.toBeNull();
        return Array.from((seletor as HTMLSelectElement).options).map((opcao) => opcao.textContent);
    }

    it("apresenta as transiÃ§Ãµes operacionais e os estados terminais", () => {
        expect(transicoesViagem.Planejada).toEqual(["Em trânsito", "Cancelada"]);
        expect(transicoesViagem["Em andamento"]).toContain("Cancelada");
        expect(transicoesViagem["Em preparação"]).toEqual(["Em coleta"]);
        expect(transicoesViagem["Em coleta"]).toEqual(["Carregando"]);
        expect(transicoesViagem.Carregando).toEqual(["Em trânsito"]);
        expect(transicoesViagem["Em trânsito"]).toEqual(["Saiu para entrega"]);
        expect(transicoesViagem["Parada operacional"]).toEqual(["Em trânsito", "Saiu para entrega", "Cancelada"]);
        expect(transicoesViagem["Saiu para entrega"]).toEqual(["Entregue"]);
        expect(transicoesViagem.Entregue).toEqual([]);
        expect(transicoesViagem.Finalizada).toEqual([]);
        expect(transicoesViagem.Cancelada).toEqual([]);
        for (const status of ["Em preparação", "Em coleta", "Carregando", "Em trânsito", "Saiu para entrega", "Entregue", "Finalizada", "Cancelada"]) expect(transicoesViagem[status]).not.toContain("Cancelada");
    });

    it("exibe criação, saída real e previsão de entrega sem converter os valores do backend", async () => {
        const datas = { data_criacao: "03/11/2026 22:37", data_saida: "03/11/2026 23:03", previsao_entrega: "04/11/2026 03:30" };
        api.mockImplementation(async (endpoint) => {
            if (endpoint === "/api/admin/viagens/7") return resposta({ ...viagem, status: "Em trânsito", ...datas });
            if (endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            throw new Error(`Consulta simulada não definida: ${endpoint}`);
        });
        montar(<DetalheViagem />, "/admin/viagens/7");
        await screen.findByText("Resumo da viagem");
        expect(screen.getByText("Criada em").nextElementSibling?.textContent).toBe(datas.data_criacao);
        expect(screen.getByText("Saída real").nextElementSibling?.textContent).toBe(datas.data_saida);
        expect(screen.getByText("Previsão de entrega").nextElementSibling?.textContent).toBe(datas.previsao_entrega);
        expect(api).toHaveBeenCalledWith("/api/admin/viagens/7");
    });

    it("usa fallback para datas operacionais nulas sem alterar a data de criação", async () => {
        api.mockImplementation(async (endpoint) => {
            if (endpoint === "/api/admin/viagens/7") return resposta({ ...viagem, status: "Em trânsito", data_criacao: "03/11/2026 22:37", data_saida: null, previsao_entrega: null });
            if (endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            throw new Error(`Consulta simulada não definida: ${endpoint}`);
        });
        montar(<DetalheViagem />, "/admin/viagens/7");
        await screen.findByText("Resumo da viagem");
        expect(screen.getByText("Criada em").nextElementSibling?.textContent).toBe("03/11/2026 22:37");
        expect(screen.getByText("Saída real").nextElementSibling?.textContent).toBe("Não informada");
        expect(screen.getByText("Previsão de entrega").nextElementSibling?.textContent).toBe("Não informada");
    });
    it("mostra Planejada para Em trânsito e envia a transiÃ§Ã£o ao endpoint administrativo", async () => {
        api.mockImplementation(async (endpoint, opcoes) => {
            if (endpoint === "/api/admin/viagens/7") return resposta({ ...viagem, status: "Planejada", codigo_carga: "TRK-HML" });
            if (endpoint === "/api/admin/viagens/7/status" && opcoes?.method === "POST") return resposta({ mensagem: "Status atualizado." });
            if (endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            throw new Error(`Consulta simulada nÃ£o definida: ${endpoint}`);
        });
        montar(<DetalheViagem />, "/admin/viagens/7");
        await screen.findByText("Atualizar status");
        const seletor = document.querySelector<HTMLSelectElement>(".status-box select")!;
        const opcoes = Array.from(seletor.options).map((opcao) => opcao.textContent);
        expect(opcoes).toContain("Em trânsito");
        expect(opcoes).not.toContain("Em coleta");
        expect(opcoes).toContain("Cancelada");
        fireEvent.change(seletor, { target: { value: "Em trânsito" } });
        fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
        await waitFor(() => expect(api).toHaveBeenCalledWith("/api/admin/viagens/7/status", expect.objectContaining({ method: "POST", body: JSON.stringify({ status: "Em trânsito" }) })));
    });

    it.each(["Em trânsito", "Saiu para entrega", "Entregue", "Finalizada", "Cancelada"])("nÃ£o oferece Cancelada em %s", async (status) => {
        api.mockImplementation(async (endpoint) => {
            if (endpoint === "/api/admin/viagens/7") return resposta({ ...viagem, status });
            if (endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
            if (endpoint.endsWith("/comprovante")) return resposta({});
            throw new Error(`Consulta simulada nÃ£o definida: ${endpoint}`);
        });
        montar(<DetalheViagem />, "/admin/viagens/7");
        await screen.findByText("Atualizar status");
        const opcoes = Array.from((document.querySelector(".status-box select") as HTMLSelectElement).options).map((opcao) => opcao.textContent);
        expect(opcoes).not.toContain("Cancelada");
        if (["Entregue", "Finalizada", "Cancelada"].includes(status)) expect(opcoes).toEqual(["Alterar status"]);
        cleanup();
    });

    it("mantÃ©m a aÃ§Ã£o Iniciar de AdminViagens enviando Em trânsito", async () => {
        api.mockImplementation(async (endpoint, opcoes) => {
            if (endpoint === "/api/admin/viagens" && opcoes?.method === "POST") throw new Error("POST inesperado na lista");
            if (endpoint === "/api/admin/viagens") return resposta([{ ...viagem, id: 7, codigo_carga: "TRK-HML", status: "Planejada", motorista: "Motorista HML", veiculo: "HML1A23", origem: "Origem", destino: "Destino", data_criacao: "Agora", data_criacao_iso: null }]);
            if (endpoint === "/api/admin/viagens/7/status" && opcoes?.method === "POST") return resposta({ mensagem: "Iniciada." });
            throw new Error(`Consulta simulada nÃ£o definida: ${endpoint}`);
        });
        montar(<AdminViagens />, "/admin/viagens");
        fireEvent.click(await screen.findByRole("button", { name: "Iniciar" }));
        await waitFor(() => expect(api).toHaveBeenCalledWith("/api/admin/viagens/7/status", expect.objectContaining({ method: "POST", body: JSON.stringify({ status: "Em trânsito" }) })));
    });
    it("não oferece Cancelada ao motorista e mantém sequência e progresso visual do cliente", async () => {
        sessionStorage.setItem("usuarioLogado", JSON.stringify({ perfil: "motorista" }));
        api.mockImplementation(async (endpoint) => endpoint === "/api/motorista/minhas-viagens/undefined"
            ? resposta({ ...viagem, status: "Em trânsito", origem: "Origem", destino: "Destino", data_criacao: "Agora", motorista: "Motorista", veiculo: "HML1A23" })
            : endpoint.endsWith("/historico") || endpoint.endsWith("/comprovantes/arquivos")
                ? resposta([])
                : endpoint.endsWith("/comprovante") ? resposta({}) : resposta([]));
        montar(<DetalheViagem />, "/portal/motorista/minhas-viagens/7");
        await screen.findByText("Atualizar status");
        const opcoesMotorista = Array.from((document.querySelector(".status-box select") as HTMLSelectElement).options).map((opcao) => opcao.textContent);
        expect(opcoesMotorista).toContain("Saiu para entrega");
        expect(opcoesMotorista).not.toContain("Cancelada");
        cleanup();

        montar(<DetalheCargaCliente />, "/portal/cliente/minhas-cargas/5");
        const etapas = await screen.findAllByText(/^(Em preparação|Em coleta|Carregando|Em trânsito|Saiu para entrega|Entregue)$/);
        const etapasStepper = etapas.filter((etapa) => etapa.closest(".cliente-progresso-etapa"));
        expect(etapasStepper.map((etapa) => etapa.textContent)).toEqual([
            "Em preparação", "Em coleta", "Carregando", "Em trânsito", "Saiu para entrega", "Entregue",
        ]);
        const etapaEmTransito = etapasStepper[3].closest(".cliente-progresso-etapa");
        expect(etapaEmTransito?.className).toContain("concluida");
        expect(etapaEmTransito?.className).toContain("atual");
        for (const etapa of etapasStepper.slice(0, 3)) {
            expect(etapa.closest(".cliente-progresso-etapa")?.className).toContain("concluida");
        }
    });
});

describe("despacho de viagem", () => {
    it("exibe toast de sucesso sem alert e redireciona para a lista de viagens", async () => {
        api.mockImplementation(async (endpoint, opcoes) => {
            if (endpoint === "/api/admin/viagens/opcoes") {
                return resposta({
                    cargas: [{ id: 5, codigo: "HML-CARGA", cliente: "Cliente HML", local_atual: "Origem HML", destino: "Destino HML", status: "Carregando" }],
                    motoristas: [{ id: 3, nome: "Motorista HML", cpf: "123", cnh: "123", categoria_cnh: "B", status: "Ativo" }],
                    veiculos: [{ id: 4, placa: "HML1A23", modelo: "Caminhão", marca: "Marca", tipo: "Caminhão", capacidade: "10t", status: "Disponível" }],
                });
            }
            if (endpoint === "/api/admin/viagens/despachar" && opcoes?.method === "POST") {
                return resposta({ mensagem: "Viagem iniciada com sucesso!" }, 201);
            }
            return leitura(endpoint);
        });

        montar(
            <NovaViagem />,
            "/admin/viagens/nova",
            { caminho: "/admin/viagens", pagina: <p>Lista de viagens</p> },
        );

        fireEvent.change(await screen.findByLabelText("Carga"), { target: { value: "5" } });
        fireEvent.change(screen.getByLabelText("Motorista"), { target: { value: "3" } });
        fireEvent.change(screen.getByLabelText("Veículo"), { target: { value: "4" } });
        fireEvent.submit(screen.getByRole("button", { name: "Iniciar Viagem" }).closest("form")!);

        expect(await screen.findByText("Viagem iniciada com sucesso!")).toBeTruthy();
        expect(screen.getByText("Viagem iniciada com sucesso!").closest("[role=status]")).toBeTruthy();
        expect(window.alert).not.toHaveBeenCalled();
        expect(await screen.findByText("Lista de viagens")).toBeTruthy();
        expect(screen.getByTestId("rota").textContent).toBe("/admin/viagens");
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
