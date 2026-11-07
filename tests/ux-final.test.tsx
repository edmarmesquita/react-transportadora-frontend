import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NotificationProvider } from "../src/components/ui/NotificationProvider";
import { apiFetch } from "../src/services/api";
import EditarCliente from "../src/pages/EditarCliente";
import EditarUsuario from "../src/pages/EditarUsuario";
import NovoUsuario from "../src/pages/NovoUsuario";
import EditarMotorista from "../src/pages/EditarMotorista";
import EditarVeiculo from "../src/pages/EditarVeiculo";
import AdminUsuarios from "../src/pages/AdminUsuarios";
import DetalheViagem from "../src/pages/DetalheViagem";
import RastreamentoViagem from "../src/components/admin/RastreamentoViagem";
import ListaComprovantes from "../src/components/admin/ListaComprovantes";

vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }));
const api = vi.mocked(apiFetch);

function resposta(dados: unknown, status = 200) {
    return new Response(JSON.stringify(dados), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function montarRota(caminho: string, pagina: ReactNode) {
    const rota = caminho
        .replace(/\/\d+\/editar$/, "/:id/editar")
        .replace(/\/\d+$/, "/:id");

    return render(
        <NotificationProvider>
            <MemoryRouter initialEntries={[caminho]}>
                <Routes>
                    <Route path={rota} element={pagina} />
                    <Route path="*" element={<output data-testid="destino" />} />
                </Routes>
            </MemoryRouter>
        </NotificationProvider>
    );
}

function campoDoRotulo(rotulo: string) {
    const campo = screen
        .getByText(rotulo)
        .parentElement
        ?.querySelector("input, select");

    if (!(campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement)) {
        throw new Error(`Campo não encontrado: ${rotulo}`);
    }

    return campo;
}

function mockUsuarioClienteLegado() {
    api.mockImplementation(async (endpoint, opcoes) => {
        if (endpoint === "/api/admin/usuarios/2" && opcoes?.method === "PUT") {
            return resposta({ mensagem: "Operação concluída." });
        }

        if (endpoint === "/api/admin/usuarios/2") {
            return resposta({
                nome: "Cliente legado",
                usuario: "cliente-legado",
                email: "",
                perfil: "cliente",
                ativo: true,
                cliente_id: null,
            });
        }

        if (endpoint === "/api/admin/clientes") {
            return resposta([
                {
                    id: 7,
                    razao_social: "Cliente Comercial HML",
                    ativo: true,
                },
            ]);
        }

        return resposta([]);
    });
}

function preencherRedefinicaoDeSenha() {
    fireEvent.click(screen.getByRole("checkbox"));

    const camposDeSenha = document.querySelectorAll<HTMLInputElement>(
        'input[type="password"]'
    );
    fireEvent.change(camposDeSenha[0], { target: { value: "senha123" } });
    fireEvent.change(camposDeSenha[1], { target: { value: "senha123" } });
}

beforeEach(() => {
    sessionStorage.setItem(
        "usuarioLogado",
        JSON.stringify({ perfil: "administrador" })
    );
    api.mockImplementation(async (endpoint, opcoes) => {
        if (opcoes?.method === "PUT" || opcoes?.method === "POST") {
            return resposta({ mensagem: "Operação concluída." }, 200);
        }

        const dados: Record<string, unknown> = {
            "/api/admin/clientes/1": {
                razao_social: "Cliente HML",
                nome_fantasia: "HML",
                ativo: true,
            },
            "/api/admin/usuarios/2": {
                nome: "Usuário HML",
                usuario: "usuario-hml",
                email: "usuario@example.invalid",
                perfil: "operador",
                ativo: true,
                cliente_id: null,
            },
            "/api/admin/clientes": [],
            "/api/admin/motoristas/3": {
                nome: "Motorista HML",
                cpf: "00000000000",
                cnh: "HML",
                categoria_cnh: "B",
                telefone: "000000000",
                email: "motorista@example.invalid",
                status: "Ativo",
            },
            "/api/admin/veiculos/4": {
                placa: "HML1A23",
                modelo: "Sintético",
                marca: "HML",
                tipo: "Truck",
                ano: "2026",
                capacidade: "1000",
                status: "Disponível",
            },
            "/api/admin/usuarios": [
                {
                    id: 2,
                    nome: "Usuário HML",
                    usuario: "usuario-hml",
                    email: "usuario@example.invalid",
                    perfil: "operador",
                    ativo: true,
                    data_criacao: "21/09/2026",
                },
            ],
            "/api/admin/viagens/7/localizacoes": [],
        };

        return resposta(dados[endpoint] ?? []);
    });
    vi.spyOn(window, "alert").mockImplementation(() => {
        throw new Error("alert nativo inesperado");
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
    expect(window.alert).not.toHaveBeenCalled();
    cleanup();
    sessionStorage.clear();
    vi.restoreAllMocks();
});

describe("Edições administrativas", () => {
    it.each([
        {
            nome: "cliente",
            caminho: "/admin/clientes/1/editar",
            pagina: <EditarCliente />,
            carregado: "Cliente HML",
            mensagem: "Cliente atualizado com sucesso!",
        },
        {
            nome: "usuário",
            caminho: "/admin/usuarios/editar/2",
            pagina: <EditarUsuario />,
            carregado: "Usuário HML",
            mensagem: "Usuário atualizado com sucesso!",
        },
        {
            nome: "motorista",
            caminho: "/admin/motoristas/3/editar",
            pagina: <EditarMotorista />,
            carregado: "Motorista HML",
            mensagem: "Motorista atualizado com sucesso!",
        },
        {
            nome: "veículo",
            caminho: "/admin/veiculos/4/editar",
            pagina: <EditarVeiculo />,
            carregado: "HML1A23",
            mensagem: "Veículo atualizado com sucesso!",
        },
    ])("usa toast ao atualizar $nome", async (caso) => {
        montarRota(caso.caminho, caso.pagina);
        expect(await screen.findByDisplayValue(caso.carregado)).toBeTruthy();

        fireEvent.submit(document.querySelector("form")!);

        expect(await screen.findByText(caso.mensagem)).toBeTruthy();
        expect(window.alert).not.toHaveBeenCalled();
    });
});

describe("Edição de usuário cliente legado", () => {
    it("envia somente os campos de senha ao redefinir a senha sem alterar o cadastro", async () => {
        mockUsuarioClienteLegado();
        montarRota("/admin/usuarios/editar/2", <EditarUsuario />);
        await screen.findByDisplayValue("Cliente legado");

        preencherRedefinicaoDeSenha();

        expect(campoDoRotulo("E-mail").required).toBe(false);
        expect(campoDoRotulo("Cliente comercial").required).toBe(false);

        fireEvent.click(
            screen.getByRole("button", { name: "Salvar Alterações" })
        );

        await waitFor(() => {
            expect(api).toHaveBeenCalledWith(
                "/api/admin/usuarios/2",
                expect.objectContaining({ method: "PUT" })
            );
        });

        const chamadaPut = api.mock.calls.find(
            ([endpoint, opcoes]) =>
                endpoint === "/api/admin/usuarios/2" &&
                opcoes?.method === "PUT"
        );
        const payload = JSON.parse(String(chamadaPut?.[1]?.body));

        expect(payload).toEqual({
            redefinir_senha: true,
            nova_senha: "senha123",
        });
        expect(payload).not.toHaveProperty("cliente_id");
        expect(JSON.stringify(payload)).not.toContain('"cliente_id":0');
    });

    it("mantém o cliente comercial obrigatório em uma edição cadastral com senha", async () => {
        mockUsuarioClienteLegado();
        montarRota("/admin/usuarios/editar/2", <EditarUsuario />);
        const nome = await screen.findByDisplayValue("Cliente legado");

        preencherRedefinicaoDeSenha();
        fireEvent.change(nome, { target: { value: "Cliente legado alterado" } });

        expect(campoDoRotulo("E-mail").required).toBe(true);
        expect(campoDoRotulo("Cliente comercial").required).toBe(true);

        fireEvent.submit(document.querySelector("form")!);

        expect(await screen.findByText("Selecione um cliente comercial.")).toBeTruthy();
        expect(
            api.mock.calls.some(([, opcoes]) => opcoes?.method === "PUT")
        ).toBe(false);
    });

    it("envia o payload completo ao selecionar um vínculo comercial", async () => {
        mockUsuarioClienteLegado();
        montarRota("/admin/usuarios/editar/2", <EditarUsuario />);
        await screen.findByDisplayValue("Cliente legado");
        await screen.findByRole("option", { name: "Cliente Comercial HML" });

        fireEvent.change(campoDoRotulo("E-mail"), {
            target: { value: "cliente@example.invalid" },
        });
        fireEvent.change(campoDoRotulo("Cliente comercial"), {
            target: { value: "7" },
        });
        fireEvent.submit(document.querySelector("form")!);

        await waitFor(() => {
            expect(
                api.mock.calls.some(([, opcoes]) => opcoes?.method === "PUT")
            ).toBe(true);
        });

        const chamadaPut = api.mock.calls.find(
            ([endpoint, opcoes]) =>
                endpoint === "/api/admin/usuarios/2" &&
                opcoes?.method === "PUT"
        );

        expect(JSON.parse(String(chamadaPut?.[1]?.body))).toEqual({
            nome: "Cliente legado",
            usuario: "cliente-legado",
            email: "cliente@example.invalid",
            perfil: "cliente",
            ativo: true,
            redefinir_senha: false,
            cliente_id: 7,
        });
    });
});

it("continua exigindo cliente comercial na criação de usuário cliente", async () => {
    montarRota("/admin/usuarios/novo", <NovoUsuario />);

    fireEvent.change(campoDoRotulo("Perfil"), {
        target: { value: "cliente" },
    });

    expect(await screen.findByText("Cliente comercial")).toBeTruthy();
    expect(campoDoRotulo("Cliente comercial").required).toBe(true);
});

it("usa toast ao registrar localização e mantém a atualização do rastreamento", async () => {
    let registrada = false;
    api.mockImplementation(async (endpoint, opcoes) => {
        if (endpoint.endsWith("/localizacoes") && opcoes?.method === "POST") {
            registrada = true;
            return resposta({ mensagem: "Registrada" }, 201);
        }

        if (endpoint.endsWith("/localizacoes") && registrada) {
            return resposta([
                {
                    id: 1,
                    localizacao: "Uberaba/MG",
                    observacao: "Localização HML",
                    data_registro: "21/09/2026 12:00",
                },
            ]);
        }

        return resposta([]);
    });

    montarRota("/admin/viagens/7/localizacoes", <RastreamentoViagem viagemId={7} />);
    const campo = await screen.findByPlaceholderText("Localização atual. Ex: Uberaba/MG");
    fireEvent.change(campo, { target: { value: "Uberaba/MG" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar Localização" }));

    expect(await screen.findByText("Localização registrada com sucesso!")).toBeTruthy();
    expect(await screen.findByText("Uberaba/MG")).toBeTruthy();
    expect(window.alert).not.toHaveBeenCalled();
});

it("atualiza a timeline da viagem do motorista após registrar localização", async () => {
    sessionStorage.setItem("usuarioLogado", JSON.stringify({ perfil: "motorista" }));
    let registrada = false;
    api.mockImplementation(async (endpoint, opcoes) => {
        if (endpoint === "/api/motorista/minhas-viagens/7" && !opcoes?.method) {
            return resposta({
                id: 7,
                codigo_carga: "HML-CARGA",
                cliente: "Cliente HML",
                motorista: "Motorista HML",
                veiculo: "HML1A23",
                origem: "Origem HML",
                destino: "Destino HML",
                status: "Em trânsito",
                data_criacao: "21/09/2026 12:00",
            });
        }
        if (endpoint === "/api/motorista/minhas-viagens/7/historico") {
            return resposta(registrada ? [
                { id: 10, status: "LOCALIZAÇÃO", observacao: "Localização Campinas/SP", data_evento: "21/09/2026 12:30" },
            ] : []);
        }
        if (endpoint === "/api/motorista/minhas-viagens/7/localizacoes" && opcoes?.method === "POST") {
            registrada = true;
            return resposta({ mensagem: "Registrada" }, 201);
        }
        if (endpoint === "/api/motorista/minhas-viagens/7/localizacoes") {
            return resposta(registrada ? [
                { id: 10, localizacao: "Campinas/SP", observacao: "Atualização HML", data_registro: "21/09/2026 12:30" },
            ] : []);
        }
        if (endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
        if (endpoint.endsWith("/comprovante")) return resposta({});
        return resposta([]);
    });

    montarRota("/portal/motorista/minhas-viagens/7", <DetalheViagem />);
    const campo = await screen.findByPlaceholderText("Localização atual. Ex: Uberaba/MG");
    fireEvent.change(campo, { target: { value: "Campinas/SP" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar localização manual" }));

    expect(await screen.findByText("Localização registrada com sucesso!")).toBeTruthy();
    expect(await screen.findByText("Localização Campinas/SP")).toBeTruthy();
    expect(screen.getByText("Campinas/SP")).toBeTruthy();
    expect(api.mock.calls.filter(([endpoint]) => endpoint === "/api/motorista/minhas-viagens/7/historico")).toHaveLength(2);
});

it("usa toast e atualiza a listagem ao inativar usuário", async () => {
    montarRota("/admin/usuarios", <AdminUsuarios />);
    await screen.findByText("Usuário HML");

    fireEvent.click(screen.getByRole("button", { name: "Inativar" }));

    expect(await screen.findByText("Usuário inativado com sucesso!")).toBeTruthy();
    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(window.alert).not.toHaveBeenCalled();
});

it("confirma ativação e mostra toast de sucesso", async () => {
    api.mockImplementation(async (endpoint, opcoes) => {
        if (endpoint === "/api/admin/usuarios" && !opcoes?.method) {
            return resposta([
                {
                    id: 2,
                    nome: "Usuário HML",
                    usuario: "usuario-hml",
                    email: "usuario@example.invalid",
                    perfil: "operador",
                    ativo: false,
                    data_criacao: "21/09/2026",
                },
            ]);
        }

        if (endpoint === "/api/admin/usuarios/2" && !opcoes?.method) {
            return resposta({
                nome: "Usuário HML",
                usuario: "usuario-hml",
                email: "usuario@example.invalid",
                perfil: "operador",
                ativo: false,
                cliente_id: null,
            });
        }

        if (endpoint === "/api/admin/usuarios/2" && opcoes?.method === "PUT") {
            return resposta({ mensagem: "Usuário ativado com sucesso!" });
        }

        return resposta([]);
    });

    montarRota("/admin/usuarios", <AdminUsuarios />);
    await screen.findByText("Usuário HML");

    fireEvent.click(screen.getByRole("button", { name: "Ativar" }));

    expect(await screen.findByText("Usuário ativado com sucesso!")).toBeTruthy();
    expect(window.confirm).toHaveBeenCalledWith("Deseja realmente ativar este usuário?");
    expect(window.alert).not.toHaveBeenCalled();
});

it("reconsulta comprovantes sem cache após uma atualização", async () => {
    const arquivo = {
        id: 8,
        nome_arquivo: "comprovante-hml.pdf",
        data_upload: "21/09/2026",
        download_endpoint: "/api/comprovantes/arquivos/8/download",
    };

    const view = render(
        <NotificationProvider>
            <ListaComprovantes arquivos={[]} />
        </NotificationProvider>
    );

    view.rerender(
        <NotificationProvider>
            <ListaComprovantes arquivos={[arquivo]} />
        </NotificationProvider>
    );

    expect(screen.getByText(arquivo.nome_arquivo)).toBeTruthy();
});

it.each([
    { falharRecarga: false, caso: "immediate timeline refresh" },
    { falharRecarga: true, caso: "saved notice when timeline refresh fails" },
])("admin location registration supports $caso", async ({ falharRecarga }) => {
    let registrada = false;
    const observacao = "Ve\u00edculo em deslocamento para Sorocaba, seguindo normalmente para o destino.";
    const evento = {
        id: 11,
        status: "LOCALIZA\u00c7\u00c3O",
        observacao,
        data_evento: "03/11/2026 20:50",
    };

    api.mockImplementation(async (endpoint, opcoes) => {
        if (endpoint === "/api/admin/viagens/7") {
            return resposta({
                id: 7,
                codigo_carga: "HML-CARGA",
                cliente: "Cliente HML",
                motorista: "Motorista HML",
                veiculo: "HML1A23",
                origem: "Origem HML",
                destino: "Destino HML",
                status: "Em andamento",
                data_criacao: "03/11/2026 18:00",
            });
        }
        if (endpoint === "/api/admin/viagens/7/historico") {
            if (registrada && falharRecarga) {
                return resposta({ erro: "Indispon\\u00edvel" }, 503);
            }
            return resposta(registrada ? [evento] : []);
        }
        if (endpoint === "/api/admin/viagens/7/localizacoes" && opcoes?.method === "POST") {
            registrada = true;
            return resposta({ mensagem: "Registrada" }, 201);
        }
        if (endpoint === "/api/admin/viagens/7/localizacoes") {
            return resposta(registrada ? [{
                id: 11,
                localizacao: "Itu/SP",
                observacao,
                data_registro: "03/11/2026 20:50",
            }] : []);
        }
        if (endpoint.endsWith("/comprovantes/arquivos")) return resposta([]);
        if (endpoint.endsWith("/comprovante")) return resposta({});
        return resposta([]);
    });

    montarRota("/admin/viagens/7", <DetalheViagem />);
    const campo = await screen.findByPlaceholderText(/localiza.*atual/i);
    fireEvent.change(campo, { target: { value: "Itu/SP" } });
    fireEvent.change(screen.getByPlaceholderText(/observa/i), {
        target: { value: observacao },
    });
    fireEvent.click(screen.getByRole("button", { name: /registrar localiza/i }));

    expect(await screen.findByText(/Localiza.*registrada com sucesso!/i)).toBeTruthy();
    expect(await screen.findByText("Itu/SP")).toBeTruthy();
    if (falharRecarga) {
        expect(await screen.findByText(/registrada, mas n.*atualizar a timeline/i)).toBeTruthy();
    } else {
        const timeline = screen.getByText("Timeline da viagem").closest(".timeline-box");
        expect(timeline).not.toBeNull();
        expect(await within(timeline!).findByText(observacao)).toBeTruthy();
    }
    expect(api.mock.calls.filter(([endpoint]) => endpoint === "/api/admin/viagens/7/historico")).toHaveLength(2);
    expect(api.mock.calls.filter(([endpoint, opcoes]) => endpoint === "/api/admin/viagens/7/localizacoes" && opcoes?.method === "POST")).toHaveLength(1);
});
