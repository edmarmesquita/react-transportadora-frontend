import GraficoStatus from "../components/admin/GraficoStatus"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AdminLayout from "../components/admin/AdminLayout"
import GraficoViagens from "../components/admin/GraficoViagens"
import RankingMotoristas from "../components/admin/RankingMotoristas"
import ResumoFrota from "../components/admin/ResumoFrota"
import ResumoFinanceiro from "../components/admin/ResumoFinanceiro"
import CentroAlertas from "../components/admin/CentroAlertas"
import IndicadoresExecutivos from "../components/admin/IndicadoresExecutivos"
import TopClientes from "../components/admin/TopClientes"
import TopRotas from "../components/admin/TopRotas"
import {
  PackageCheck,
  Route,
  ClipboardList,
  AlertTriangle
} from "lucide-react"
import { apiFetch } from "../services/api"


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
            const resposta = await apiFetch(
                "/api/admin/resumo"
            )

            const dados = await resposta.json()

            setResumo(dados)

            const respostaCargas = await apiFetch(
                "/api/admin/cargas"
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
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>🚚 Central de Operações</h1>

                        <p>
                            Controle e monitoramento em tempo real da
                            Transportadora Ramos.
                        </p>
                    </div>
                </div>

                <div className="cards-dashboard">
                    <div className="card-dashboard card-transito">
                        <div className="card-topo">
                            <h3>Em Trânsito</h3>

                            <Route size={32} />
                        </div>

                        <strong>{resumo?.em_transito}</strong>
                    </div>

                    <div className="card-dashboard card-entregues">
                        <div className="card-topo">
                            <h3>Entregues</h3>

                            <PackageCheck size={32} />
                        </div>

                        <strong>{resumo?.entregues}</strong>
                    </div>

                    <div className="card-dashboard card-cotacoes">
                        <div className="card-topo">
                            <h3>Cotações</h3>

                            <ClipboardList size={32} />
                        </div>

                        <strong>{resumo?.total_cotacoes}</strong>
                    </div>

                    <div className="card-dashboard card-atrasadas">
                        <div className="card-topo">
                            <h3>Cargas Atrasadas</h3>

                            <AlertTriangle size={32} />
                        </div>

                        <strong>{resumo?.atrasadas || 0}</strong>
                    </div>
                </div>

                <ResumoFinanceiro />

                <IndicadoresExecutivos />

                <TopClientes />

                <CentroAlertas />

                <TopRotas />

                <GraficoStatus
                    emColeta={resumo?.em_coleta || 0}
                    emTransito={resumo?.em_transito || 0}
                    saiuEntrega={resumo?.saiu_entrega || 0}
                    entregues={resumo?.entregues || 0}
                />

                <GraficoViagens />
                <RankingMotoristas />
                <ResumoFrota />
            
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

                                <td>
                                    <Link
                                        to={`/admin/cargas/${carga.id}`}
                                        className="btn-detalhes"
                                    >
                                        Ver detalhes
                                    </Link>
                                </td>
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