import { useEffect, useState } from "react"

import AdminLayout from "../components/admin/AdminLayout"
import { Link } from "react-router-dom"
import AdminHeader from "../components/layout/AdminHeader"
import { apiFetch } from "../services/api"

type Cliente = {
    id: number
    razao_social: string
    nome_fantasia: string
    documento: string
    responsavel: string
    email: string
    telefone: string
    cidade: string
    estado: string
    ativo: boolean
}

function AdminClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [filtroStatus, setFiltroStatus] = useState("Todos")

    async function carregarClientes() {
        const resposta = await apiFetch(
            "/api/admin/clientes"
        )

        const dados = await resposta.json()

        setClientes(dados)
    }

    async function inativarCliente(id: number) {
        const confirmar = window.confirm("Deseja inativar este cliente?")

        if (!confirmar) return

        const resposta = await apiFetch(`/api/admin/clientes/${id}/inativar`, {
            method: "PUT",
        })

        const dados = await resposta.json().catch(() => null)

        if (resposta.status === 403) {
            alert(
                dados?.erro ||
                "Você não possui permissão para inativar clientes."
            )
            return
        }

        if (!resposta.ok) {
            alert(
                dados?.erro ||
                dados?.msg ||
                "Não foi possível inativar o cliente."
            )
            return
        }

        carregarClientes()
    }

    useEffect(() => {
        carregarClientes()
    }, [])

    const clientesFiltrados = clientes.filter((cliente) => {
        if (filtroStatus === "Todos") return true
        if (filtroStatus === "Ativos") return cliente.ativo
        if (filtroStatus === "Inativos") return !cliente.ativo

        return true
    })

    return (
        <AdminLayout>
            <div className="admin-page admin-clientes-page">
                <AdminHeader
                    title="Clientes"
                    subtitle="Gerencie os clientes cadastrados."
                >
                    <Link to="/admin/clientes/novo" className="btn-primary">
                        Novo Cliente
                    </Link>
                </AdminHeader>

                <div className="tabela-cargas admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Razão Social</th>
                                <th>Responsável</th>
                                <th>Telefone</th>
                                <th>Cidade</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {clientesFiltrados.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td>{cliente.razao_social}</td>

                                    <td>{cliente.responsavel}</td>

                                    <td>{cliente.telefone}</td>

                                    <td>
                                        {cliente.cidade}/{cliente.estado}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                cliente.ativo
                                                    ? "status status-entregue"
                                                    : "status status-atrasada"
                                            }
                                        >
                                            {cliente.ativo
                                                ? "Ativo"
                                                : "Inativo"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="acoes-tabela admin-table-actions">
                                            <Link
                                                to={`/admin/clientes/${cliente.id}/editar`}
                                                className="btn-editar"
                                            >
                                                Editar
                                            </Link>

                                            <button
                                                className="btn-excluir"
                                                onClick={() => inativarCliente(cliente.id)}
                                            >
                                                Inativar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="filtro-status">
                    <button onClick={() => setFiltroStatus("Todos")}>Todos</button>
                    <button onClick={() => setFiltroStatus("Ativos")}>Ativos</button>
                    <button onClick={() => setFiltroStatus("Inativos")}>Inativos</button>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminClientes
