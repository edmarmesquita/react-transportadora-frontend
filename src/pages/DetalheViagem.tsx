import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"
import FormComprovanteEntrega from "../components/admin/FormComprovanteEntrega"
import ListaComprovantes from "../components/admin/ListaComprovantes"
import RastreamentoViagem from "../components/admin/RastreamentoViagem"

type Historico = {
    id: number
    status: string
    observacao: string
    data_evento: string
}

type ViagemDetalhe = {
    id: number
    codigo_carga: string
    cliente: string
    motorista: string
    veiculo: string
    origem: string
    destino: string
    status: string
    data_criacao: string
}

type Ocorrencia = {
    id: number
    descricao: string
    data: string
}

function DetalheViagem() {
    const { id } = useParams()

    const [historico, setHistorico] = useState<Historico[]>([])
    const [viagem, setViagem] = useState<ViagemDetalhe | null>(null)
    const [novoStatus, setNovoStatus] = useState("")
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([])
    const [novaOcorrencia, setNovaOcorrencia] = useState("")

    async function atualizarStatus() {
        if (!novoStatus) return

        await fetch(
            `http://127.0.0.1:5000/api/admin/viagens/${id}/status`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: novoStatus,
                }),
            }
        )

        setNovoStatus("")

        carregarHistorico()
    }

    async function carregarHistorico() {
        const resposta = await fetch(
            `http://127.0.0.1:5000/api/admin/viagens/${id}/historico`
        )

        const dados = await resposta.json()

        setHistorico(dados)
    }

    async function carregarViagem() {
        const resposta = await fetch(
            `http://127.0.0.1:5000/api/admin/viagens/${id}`
        )

        const dados = await resposta.json()

        setViagem(dados)
    }

    async function carregarOcorrencias() {
        const resposta = await fetch(
            `http://127.0.0.1:5000/api/admin/viagens/${id}/ocorrencias`
        )

        const dados = await resposta.json()

        setOcorrencias(dados)
    }

    async function registrarOcorrencia() {
        if (!novaOcorrencia) return

        await fetch(
            `http://127.0.0.1:5000/api/admin/viagens/${id}/ocorrencias`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    descricao: novaOcorrencia,
                }),
            }
        )

        setNovaOcorrencia("")

        carregarOcorrencias()
        carregarHistorico()
    }

    useEffect(() => {
        carregarViagem()
        carregarHistorico()
        carregarOcorrencias()
    }, [])
    return (
        <AdminLayout>
            <div className="admin-page detalhe-viagem-page">
                <div className="page-header">
                    <div>
                        <h1>Detalhes da Viagem</h1>
                        <p>Timeline operacional da viagem</p>
                    </div>
                </div>

                <FormComprovanteEntrega viagemId={Number(id)} />
                <ListaComprovantes viagemId={Number(id)} />
                <RastreamentoViagem viagemId={Number(id)} />

                {viagem && (
                    <div className="viagem-info-box">
                        <h2>{viagem.codigo_carga}</h2>

                        <p><strong>Cliente:</strong> {viagem.cliente}</p>
                        <p><strong>Motorista:</strong> {viagem.motorista || "Não definido"}</p>
                        <p><strong>Veículo:</strong> {viagem.veiculo || "Não definido"}</p>
                        <p><strong>Origem:</strong> {viagem.origem}</p>
                        <p><strong>Destino:</strong> {viagem.destino}</p>
                        <p><strong>Status:</strong> {viagem.status}</p>
                    </div>
                )}

                <div className="status-box">
                    <select
                        value={novoStatus}
                        onChange={(e) =>
                            setNovoStatus(e.target.value)
                        }
                    >
                        <option value="">
                            Alterar status
                        </option>

                        <option>Em coleta</option>
                        <option>Em trânsito</option>
                        <option>Saiu para entrega</option>
                        <option>Entregue</option>
                    </select>

                    <button
                        className="btn-nova-carga"
                        onClick={atualizarStatus}
                    >
                        Atualizar
                    </button>
                </div>

                <div className="ocorrencia-box">
                    <textarea
                        placeholder="Registrar ocorrência..."
                        value={novaOcorrencia}
                        onChange={(e) =>
                            setNovaOcorrencia(e.target.value)
                        }
                    />

                    <button
                        className="btn-nova-carga"
                        onClick={registrarOcorrencia}
                    >
                        Registrar Ocorrência
                    </button>
                </div>

                <div className="timeline-box">
                    {historico.map((item) => (
                        <div className="timeline-item" key={item.id}>
                            <div
                                className={`timeline-dot ${item.status === "Comprovante anexado"
                                        ? "dot-arquivo"
                                        : item.status === "Ocorrência"
                                            ? "dot-ocorrencia"
                                            : item.status === "Entregue"
                                                ? "dot-entregue"
                                                : ""
                                    }`}
                            />

                            <div>
                                <h3>{item.status}</h3>
                                <p>{item.observacao}</p>
                                <span>{item.data_evento}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="ocorrencias-lista">
                    <h2>Ocorrências</h2>

                    {ocorrencias.map((item) => (
                        <div
                            key={item.id}
                            className="ocorrencia-item"
                        >
                            <p>{item.descricao}</p>

                            <span>{item.data}</span>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    )
}

export default DetalheViagem