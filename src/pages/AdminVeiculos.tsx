import { useEffect, useState } from "react"

import AdminLayout from "../components/admin/AdminLayout"
import { Link } from "react-router-dom"
import { apiFetch } from "../services/api"
import AdminHeader from "../components/layout/AdminHeader"

type Veiculo = {
    id: number
    placa: string
    modelo: string
    marca: string
    tipo: string
    ano: string
    capacidade: string
    status: string
}

function AdminVeiculos() {
    const [veiculos, setVeiculos] = useState<Veiculo[]>([])
    const [filtroStatus, setFiltroStatus] = useState("Todos")

    async function carregarVeiculos() {
        const resposta = await apiFetch("/api/admin/veiculos")

        const dados = await resposta.json()

        setVeiculos(dados)
    }

    useEffect(() => {
        carregarVeiculos()
    }, [])

    async function inativarVeiculo(id: number) {
        const confirmar = window.confirm(
            "Deseja inativar este veículo?"
        )

        if (!confirmar) return

        const resposta = await apiFetch(
            `/api/admin/veiculos/${id}/inativar`,
            {
                method: "PUT",
            }
        )

        const dados = await resposta.json().catch(() => ({}))

        if (resposta.status === 403) {
            alert(dados.erro || "Você não possui permissão para inativar veículos.")
            return
        }

        if (!resposta.ok) {
            alert(dados.erro || "Não foi possível inativar o veículo.")
            return
        }

        carregarVeiculos()
    }

    const veiculosFiltrados = veiculos.filter((veiculo) => {
        if (filtroStatus === "Todos") return true

        return veiculo.status === filtroStatus
    })

    return (
        <AdminLayout>
            <div className="admin-page admin-veiculos-page">
                <AdminHeader
                    title="Veículos"
                    subtitle="Gerencie os veículos da frota."
                >
                    <Link to="/admin/veiculos/novo" className="btn-primary">
                        Novo Veículo
                    </Link>
                </AdminHeader>

                <div className="tabela-cargas admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Placa</th>
                                <th>Modelo</th>
                                <th>Marca</th>
                                <th>Tipo</th>
                                <th>Ano</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {veiculosFiltrados.map((veiculo) => (
                                <tr key={veiculo.id}>
                                    <td>{veiculo.placa}</td>
                                    <td>{veiculo.modelo}</td>
                                    <td>{veiculo.marca}</td>
                                    <td>{veiculo.tipo}</td>
                                    <td>{veiculo.ano}</td>
                                    <td>
                                        <span className="status status-entregue">
                                            {veiculo.status}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="acoes-carga admin-table-actions">
                                            <Link
                                                to={`/admin/veiculos/${veiculo.id}/editar`}
                                                className="btn-editar"
                                            >
                                                Editar
                                            </Link>

                                            <button
                                                className="btn-excluir"
                                                onClick={() => inativarVeiculo(veiculo.id)}
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
                    <button onClick={() => setFiltroStatus("Disponível")}>Disponíveis</button>
                    <button onClick={() => setFiltroStatus("Em viagem")}>Em viagem</button>
                    <button onClick={() => setFiltroStatus("Manutenção")}>Manutenção</button>
                    <button onClick={() => setFiltroStatus("Inativo")}>Inativos</button>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminVeiculos
