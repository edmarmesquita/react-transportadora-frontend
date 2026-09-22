import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NotificationProvider } from "../src/components/ui/NotificationProvider";
import { apiFetch } from "../src/services/api";
import EditarCliente from "../src/pages/EditarCliente";
import EditarUsuario from "../src/pages/EditarUsuario";
import EditarMotorista from "../src/pages/EditarMotorista";
import EditarVeiculo from "../src/pages/EditarVeiculo";
import AdminUsuarios from "../src/pages/AdminUsuarios";
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

    api.mockResolvedValueOnce(resposta([]));
    const view = render(
        <NotificationProvider>
            <ListaComprovantes viagemId={7} atualizacao={0} />
        </NotificationProvider>
    );

    await waitFor(() => {
        expect(api).toHaveBeenCalledWith(
            "/api/admin/viagens/7/comprovantes/arquivos",
            { cache: "no-store" }
        );
    });

    api.mockResolvedValueOnce(resposta([arquivo]));
    view.rerender(
        <NotificationProvider>
            <ListaComprovantes viagemId={7} atualizacao={1} />
        </NotificationProvider>
    );

    expect(await screen.findByText(arquivo.nome_arquivo)).toBeTruthy();
    expect(api).toHaveBeenLastCalledWith(
        "/api/admin/viagens/7/comprovantes/arquivos",
        { cache: "no-store" }
    );
});
