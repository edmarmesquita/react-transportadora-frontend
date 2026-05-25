import { useState } from "react"

import BrazilMap from "./BrazilMap"
import TrackingForm from "./TrackingForm"

type TrackingData = {
    id: number
    codigo: string
    cliente: string
    status: string
    local_atual: string
    destino: string
    ultima_atualizacao: string
}

function TrackingSection() {
    const [resultado, setResultado] = useState<TrackingData | null>(null)
    const [erro, setErro] = useState("")
    const [loading, setLoading] = useState(false)

    async function buscarRastreamento(codigo: string) {
        setLoading(true)
        setErro("")
        setResultado(null)

        try {
            const resposta = await fetch(
                `http://127.0.0.1:5000/api/rastreamento/${codigo}`
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                setErro(dados.erro || "Erro ao buscar rastreamento.")
                setLoading(false)
                return
            }

            setResultado(dados)
            setLoading(false)
        } catch {
            setErro("Erro ao conectar com o servidor.")
            setLoading(false)
        }
    }

    return (
        <section id="rastreamento" className="tracking-section">
            <div className="container-central">
                <div className="rastreamento-box">
                    <div className="rastreamento-info">
                        <h2>Rastreamento Nacional</h2>

                        <p>
                            Acompanhe o status da sua carga em território nacional com mais
                            transparência, segurança e agilidade.
                        </p>

                        <TrackingForm
                            onBuscar={buscarRastreamento}
                            loading={loading}
                        />

                        {erro && <p className="mensagem-erro">{erro}</p>}

                        {resultado && (
                            <div className="status-rastreamento-preview">
                                <p><strong>Código:</strong> {resultado.codigo}</p>
                                <p><strong>Cliente:</strong> {resultado.cliente}</p>
                                <p><strong>Status:</strong> {resultado.status}</p>
                                <p><strong>Local atual:</strong> {resultado.local_atual}</p>
                                <p><strong>Destino:</strong> {resultado.destino}</p>
                                <p>
                                    <strong>Última atualização:</strong>{" "}
                                    {resultado.ultima_atualizacao}
                                </p>
                            </div>
                        )}
                    </div>

                    <BrazilMap />
                </div>
            </div>
        </section>
    )
}

export default TrackingSection