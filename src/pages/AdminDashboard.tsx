import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AdminLayout from "../components/admin/AdminLayout"

type ResumoDashboard = {
    total_cargas: number
    em_coleta: number
    em_transito: number
    entregues: number
    saiu_entrega: number
    atrasadas: number
    total_cotacoes: number
}

type Carga = {
    id: number
    codigo: string
    cliente: string
    status: string
    local_atual: string
    destino: string
}

function AdminDashboard() {
    const [resumo, setResumo] =
        useState<ResumoDashboard | null>(null)

    const [loading, setLoading] = useState(true)

    const [cargas, setCargas] = useState<Carga[]>([])

    async function carregarResumo() {
        try {
            const resposta = await fetch(
                "http://127.0.0.1:5000/api/admin/resumo"
            )

            const dados = await resposta.json()

            setResumo(dados)

            const respostaCargas = await fetch(
                "http://127.0.0.1:5000/api/admin/cargas"
            )

            const dadosCargas = await respostaCargas.json()

            setCargas(dadosCargas)

            setLoading(false)
        } catch {
            console.log("Erro ao carregar dashboard.")

            setLoading(false)
        }
    }

    useEffect(() => {
        carregarResumo()
    }, [])

    if (loading) {
        return <h1>Carregando painel...</h1>
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <h1>Painel Administrativo</h1>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Total de Cargas</h3>
                    <strong>{resumo?.total_cargas}</strong>
                </div>

                <div className="dashboard-card">
                    <h3>Em Trânsito</h3>
                    <strong>{resumo?.em_transito}</strong>
                </div>

                <div className="dashboard-card">
                    <h3>Entregues</h3>
                    <strong>{resumo?.entregues}</strong>
                </div>

                <div className="dashboard-card">
                    <h3>Atrasadas</h3>
                    <strong>{resumo?.atrasadas}</strong>
                </div>

                <div className="dashboard-card">
                    <h3>Cotações</h3>
                    <strong>{resumo?.total_cotacoes}</strong>
                </div>
            </div>

            <div className="tabela-cargas">
                <h2>Últimas Cargas</h2>

                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cliente</th>
                            <th>Status</th>
                            <th>Local Atual</th>
                            <th>Destino</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {cargas.map((carga) => (
                            <tr key={carga.id}>
                                <td>{carga.codigo}</td>

                            <td>{carga.cliente}</td>

                            <td>
                                <span
                                    className={`status status-${carga.status
                                        .toLowerCase()
                                        .replaceAll(" ", "-")}`}
                                >
                                    {carga.status}
                                </span>
                            </td>

                            <td>{carga.local_atual}</td>

                            <td>{carga.destino}</td>

                                <Link
                                    to={`/admin/carga/${carga.id}`}
                                    className="btn-detalhes"
                                >
                                    Ver detalhes
                                </Link>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>
        </AdminLayout>
    )
}

export default AdminDashboard