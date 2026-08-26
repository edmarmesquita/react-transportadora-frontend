import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../components/admin/AdminLayout";
import AdminHeader from "../components/layout/AdminHeader";

import { apiFetch } from "../services/api";
import { buscarUsuarioLogado } from "../services/authService";
import { useNotification } from "../components/ui/NotificationProvider";

type Motorista = {
    id: number;
    nome: string;
    cpf: string;
    cnh: string;
    categoria_cnh: string;
    validade_cnh: string;
    telefone: string;
    email: string;
    status: string;
    disponibilidade: string;
};

type FiltroStatus = "Todos" | "Ativos" | "Inativos";

function AdminMotoristas() {
    const { notificar } = useNotification();
    const usuario = buscarUsuarioLogado();
    const administrador =
        usuario?.perfil?.trim().toLowerCase() === "administrador";
    const [motoristas, setMotoristas] = useState<Motorista[]>([]);
    const [filtroStatus, setFiltroStatus] =
        useState<FiltroStatus>("Todos");

    const [carregando, setCarregando] = useState(true);
    const [processandoId, setProcessandoId] =
        useState<number | null>(null);

    useEffect(() => {
        carregarMotoristas();
    }, []);

    async function carregarMotoristas() {
        try {
            setCarregando(true);

            const resposta = await apiFetch(
                "/api/admin/motoristas"
            );

            const dados = await resposta.json().catch(() => null);

            if (!resposta.ok) {
                const mensagem =
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível carregar os motoristas.";

                notificar(
                    resposta.status === 403 ? "aviso" : "erro",
                    mensagem
                );
                return;
            }

            setMotoristas(Array.isArray(dados) ? dados : []);
        } catch (error) {
            notificar(
                "erro",
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar os motoristas."
            );
        } finally {
            setCarregando(false);
        }
    }

    async function alterarStatusMotorista(
        motorista: Motorista
    ) {
        const estaAtivo =
            motorista.status.toLowerCase() === "ativo";

        const acao = estaAtivo ? "inativar" : "ativar";

        const confirmar = window.confirm(
            `Deseja ${acao} o motorista ${motorista.nome}?`
        );

        if (!confirmar) return;

        try {
            setProcessandoId(motorista.id);

            const resposta = await apiFetch(
                `/api/admin/motoristas/${motorista.id}/${acao}`,
                {
                    method: "PUT",
                }
            );

            const dados = await resposta.json().catch(() => null);

            if (!resposta.ok) {
                const mensagem =
                    dados?.erro ||
                    dados?.msg ||
                    (resposta.status === 403
                        ? "Você não possui permissão para alterar o status de motoristas."
                        : resposta.status === 409
                            ? "Não é possível inativar este motorista enquanto houver viagem ou carga ativa."
                            : `Não foi possível ${acao} o motorista.`);

                notificar(
                    resposta.status === 403 || resposta.status === 409
                        ? "aviso"
                        : "erro",
                    mensagem
                );
                return;
            }

            await carregarMotoristas();
            notificar(
                "sucesso",
                dados?.mensagem ||
                `Motorista ${estaAtivo ? "inativado" : "ativado"} com sucesso.`
            );
        } catch (error) {
            notificar(
                "erro",
                error instanceof Error
                    ? error.message
                    : `Não foi possível ${acao} o motorista.`
            );
        } finally {
            setProcessandoId(null);
        }
    }

    const motoristasFiltrados = useMemo(() => {
        return motoristas.filter((motorista) => {
            const status = motorista.status.toLowerCase();

            if (filtroStatus === "Ativos") {
                return status === "ativo";
            }

            if (filtroStatus === "Inativos") {
                return status === "inativo";
            }

            return true;
        });
    }, [motoristas, filtroStatus]);

    function classeStatus(disponibilidade: string) {
        return disponibilidade.toLowerCase() === "disponível"
            ? "status status-disponível"
            : "status status-indisponível";
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <AdminHeader
                    title="Motoristas"
                    subtitle="Gerencie os motoristas cadastrados."
                >
                    <Link
                        to="/admin/motoristas/novo"
                        className="btn-primary"
                    >
                        Novo Motorista
                    </Link>
                </AdminHeader>

                <div className="filtro-status">
                    <button
                        type="button"
                        className={
                            filtroStatus === "Todos"
                                ? "filtro-ativo"
                                : ""
                        }
                        onClick={() =>
                            setFiltroStatus("Todos")
                        }
                    >
                        Todos
                    </button>

                    <button
                        type="button"
                        className={
                            filtroStatus === "Ativos"
                                ? "filtro-ativo"
                                : ""
                        }
                        onClick={() =>
                            setFiltroStatus("Ativos")
                        }
                    >
                        Ativos
                    </button>

                    <button
                        type="button"
                        className={
                            filtroStatus === "Inativos"
                                ? "filtro-ativo"
                                : ""
                        }
                        onClick={() =>
                            setFiltroStatus("Inativos")
                        }
                    >
                        Inativos
                    </button>
                </div>

                {carregando && (
                    <p>Carregando motoristas...</p>
                )}

                {!carregando && (
                    <div className="tabela-cargas">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>CNH</th>
                                    <th>Categoria</th>
                                    <th>Validade</th>
                                    <th>Telefone</th>
                                    <th>Status</th>
                                    <th>Disponibilidade</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {motoristasFiltrados.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="tabela-vazia"
                                        >
                                            Nenhum motorista encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    motoristasFiltrados.map(
                                        (motorista) => {
                                            const estaAtivo =
                                                motorista.status.toLowerCase() === "ativo";
                                            const processando =
                                                processandoId ===
                                                motorista.id;

                                            return (
                                                <tr
                                                    key={
                                                        motorista.id
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            motorista.nome
                                                        }
                                                    </td>

                                                    <td>
                                                        {motorista.cpf ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {motorista.cnh ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {motorista.categoria_cnh ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {motorista.validade_cnh ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {motorista.telefone ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={classeStatus(
                                                                motorista.status
                                                            )}
                                                        >
                                                            {motorista.status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={classeStatus(
                                                                motorista.disponibilidade
                                                            )}
                                                        >
                                                            {motorista.disponibilidade}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="acoes-tabela">
                                                            <Link
                                                                to={`/admin/motoristas/${motorista.id}/editar`}
                                                                className="btn-editar"
                                                            >
                                                                Editar
                                                            </Link>

                                                            {administrador && (
                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        estaAtivo
                                                                            ? "btn-excluir"
                                                                            : "btn-ativar"
                                                                    }
                                                                    disabled={processando}
                                                                    onClick={() =>
                                                                        alterarStatusMotorista(
                                                                            motorista
                                                                        )
                                                                    }
                                                                >
                                                                    {processando
                                                                        ? "Aguarde..."
                                                                        : estaAtivo
                                                                            ? "Inativar"
                                                                            : "Ativar"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminMotoristas;
