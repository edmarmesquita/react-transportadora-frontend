import { useEffect, useState } from "react"

import AdminLayout from "../components/admin/AdminLayout"
import { Link } from "react-router-dom"
import AdminHeader from "../components/layout/AdminHeader"
import { apiFetch } from "../services/api"
import { buscarUsuarioLogado } from "../services/authService"
import { useNotification } from "../components/ui/NotificationProvider"

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
    const { notificar } = useNotification()
    const administrador = buscarUsuarioLogado()?.perfil?.trim().toLowerCase() === "administrador"
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [busca, setBusca] = useState("")
    const [filtroStatus, setFiltroStatus] = useState("Todos")

    async function carregarClientes() {
        const resposta = await apiFetch(
            "/api/admin/clientes"
        )

        const dados = await resposta.json()

        setClientes(dados)
    }

    async function inativarCliente(id: number) {
        if (!administrador) return

        const confirmar = window.confirm("Deseja inativar este cliente?")

        if (!confirmar) return

        try {
            const resposta = await apiFetch(`/api/admin/clientes/${id}/inativar`, {
                method: "PUT",
            })
            const dados = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                notificar(
                    resposta.status === 403 || resposta.status === 409 ? "aviso" : "erro",
                    dados?.erro || dados?.msg || "Não foi possível inativar o cliente."
                )
                return
            }

            setClientes((atuais) => atuais.map((cliente) =>
                cliente.id === id ? { ...cliente, ativo: false } : cliente
            ))
            notificar("sucesso", "Cliente inativado com sucesso!")
        } catch {
            notificar("erro", "Erro ao conectar com o servidor.")
        }
    }

    useEffect(() => {
        carregarClientes()
    }, [])

    const clientesFiltrados = clientes.filter((cliente) => {
        const termoBusca = busca.trim().toLowerCase()
        const status = cliente.ativo ? "ativo" : "inativo"
        const atendeBusca = !termoBusca || [
            cliente.razao_social,
            cliente.nome_fantasia,
            cliente.documento,
            cliente.responsavel,
            cliente.email,
            cliente.telefone,
            cliente.cidade,
            cliente.estado,
            status,
        ].some((valor) =>
            String(valor ?? "").toLowerCase().includes(termoBusca)
        )

        if (!atendeBusca) return false
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
                    <div className="data-table-toolbar">
                        <input
                            className="data-table-search"
                            type="text"
                            placeholder="Pesquisar clientes..."
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                        />
                    </div>

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
                            {clientesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="tabela-vazia">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : clientesFiltrados.map((cliente) => (
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

                                            {administrador && <button
                                                className="btn-excluir"
                                                onClick={() => inativarCliente(cliente.id)}
                                            >
                                                Inativar
                                            </button>}
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
