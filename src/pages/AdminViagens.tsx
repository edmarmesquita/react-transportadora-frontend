import { useEffect, useState } from "react"

import AdminLayout from "../components/admin/AdminLayout"
import { Link } from "react-router-dom"
import { Eye } from "lucide-react"
import AdminHeader from "../components/layout/AdminHeader"
import { apiFetch } from "../services/api"
import { useNotification } from "../components/ui/NotificationProvider"

type Viagem = {
    id: number
    codigo_carga: string
    cliente: string
    motorista: string
    veiculo: string
    origem: string
    destino: string
    status: string
    data_criacao: string
    data_criacao_iso: string | null
}

function AdminViagens() {
    const { notificar } = useNotification()
    const [viagens, setViagens] = useState<Viagem[]>([])
    const [busca, setBusca] = useState("")
    const [filtroStatus, setFiltroStatus] = useState("Todos")

    async function carregarViagens() {
        try {
            const resposta = await apiFetch(
                "/api/admin/viagens"
            )

            const dados = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                notificar(
                    resposta.status === 403 ? "aviso" : "erro",
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível carregar as viagens."
                )
                return
            }

            setViagens(Array.isArray(dados) ? dados : [])
        } catch {
            notificar("erro", "Não foi possível carregar as viagens.")
        }
    }

    useEffect(() => {
        carregarViagens()
    }, [])

    const viagensFiltradas = viagens.filter((viagem) => {
        const textoBusca = busca.toLowerCase()

        const atendeBusca =
            viagem.codigo_carga.toLowerCase().includes(textoBusca) ||
            viagem.cliente.toLowerCase().includes(textoBusca) ||
            viagem.motorista.toLowerCase().includes(textoBusca) ||
            viagem.veiculo.toLowerCase().includes(textoBusca)

        const atendeStatus =
            filtroStatus === "Todos" || viagem.status === filtroStatus

        return atendeBusca && atendeStatus
    })

    function calcularTempo(dataIso: string | null) {
        if (!dataIso) return "Não informado"

        const inicio = new Date(dataIso)
        const agora = new Date()

        const diffMs = agora.getTime() - inicio.getTime()
        const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (dias === 0) return "Hoje"
        if (dias === 1) return "1 dia"

        return `${dias} dias`
    }

    function classeTempo(dataIso: string | null) {
        if (!dataIso) return "tempo-neutro"

        const inicio = new Date(dataIso)
        const agora = new Date()

        const diffMs = agora.getTime() - inicio.getTime()
        const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (dias === 0) return "tempo-hoje"
        if (dias <= 3) return "tempo-recente"
        if (dias <= 7) return "tempo-atencao"

        return "tempo-critico"
    }

    async function atualizarStatusViagem(id: number, status: string) {
        try {
            const resposta = await apiFetch(`/api/admin/viagens/${id}/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            })

            const dados = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                notificar(
                    resposta.status === 403 || resposta.status === 409
                        ? "aviso"
                        : "erro",
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível atualizar o status da viagem."
                )
                return
            }

            await carregarViagens()
            notificar(
                "sucesso",
                dados?.mensagem || "Status atualizado com sucesso."
            )
        } catch {
            notificar("erro", "Não foi possível atualizar o status da viagem.")
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <AdminHeader
                    title="Viagens"
                    subtitle="Gerencie e acompanhe as viagens da transportadora."
                >
                    <Link
                        to="/admin/viagens/nova"
                        className="btn-primary"
                    >
                        Nova Viagem
                    </Link>
                </AdminHeader>

                <div className="tabela-cargas">
                    <table>
                        <thead>
                            <tr>
                                <th>Carga</th>
                                <th>Cliente</th>
                                <th>Motorista</th>
                                <th>Veículo</th>
                                <th>Rota</th>
                                <th>Status</th>
                                <th>Criada em</th>
                                <th>Ações</th>
                                <th>Tempo</th>
                            </tr>
                        </thead>

                        <tbody>
                            {viagensFiltradas.map((viagem) => (
                                <tr
                                    key={viagem.id}
                                    className={`linha-viagem linha-${viagem.status
                                        .toLowerCase()
                                        .replaceAll(" ", "-")} ${classeTempo(
                                            viagem.data_criacao_iso
                                        )}`}
                                >
                                    <td>{viagem.codigo_carga}</td>
                                    <td>{viagem.cliente}</td>
                                    <td>{viagem.motorista || "Não definido"}</td>
                                    <td>{viagem.veiculo || "Não definido"}</td>

                                    <td>
                                        <div className="rota-viagem">
                                            <span>{viagem.origem}</span>
                                            <strong>→</strong>
                                            <span>{viagem.destino}</span>
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={`status status-${viagem.status
                                                .toLowerCase()
                                                .replaceAll(" ", "-")}`}
                                        >
                                            {viagem.status}
                                        </span>
                                    </td>

                                    <td>{viagem.data_criacao}</td>

                                    <td>
                                        <Link
                                            to={`/admin/viagens/${viagem.id}`}
                                            className="btn-detalhes btn-icone"
                                        >
                                            <Eye size={16} />
                                            Detalhes
                                        </Link>
                                    </td>

                                    {viagem.status === "Planejada" && (
                                        <button
                                            className="btn-editar btn-icone"
                                            onClick={() =>
                                                atualizarStatusViagem(viagem.id, "Em trânsito")
                                            }
                                        >
                                            Iniciar
                                        </button>
                                    )}

                                    {viagem.status === "Em trânsito" && (
                                        <Link
                                            to={`/admin/viagens/${viagem.id}`}
                                            className="btn-whatsapp btn-icone"
                                        >
                                            Finalizar
                                        </Link>
                                    )}

                                    <td>
                                        <span className={`tempo-badge ${classeTempo(viagem.data_criacao_iso)}`}>
                                            {calcularTempo(viagem.data_criacao_iso)}
                                        </span>
                                    </td>
                                    
                                
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="busca-box">
                <input
                    type="text"
                    placeholder="Buscar por carga, cliente, motorista ou veículo..."
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                />
            </div>

            <div className="filtro-status">
                <button onClick={() => setFiltroStatus("Todos")}>Todos</button>
                <button onClick={() => setFiltroStatus("Planejada")}>Planejadas</button>
                <button onClick={() => setFiltroStatus("Em trânsito")}>Em trânsito</button>
                <button onClick={() => setFiltroStatus("Saiu para entrega")}>Entrega</button>
                <button onClick={() => setFiltroStatus("Entregue")}>Entregues</button>
            </div>

            <p className="resultado-busca">
                {viagensFiltradas.length} viagem(ns) encontrada(s)
            </p>
        </AdminLayout>
    )
}

export default AdminViagens
