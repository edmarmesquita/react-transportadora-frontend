import { useEffect, useState } from "react"

type Props = {
    viagemId: number
}

type Localizacao = {
    id: number
    localizacao: string
    observacao: string
    data_registro: string
}

function RastreamentoViagem({ viagemId }: Props) {
    const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([])
    const [localizacao, setLocalizacao] = useState("")
    const [observacao, setObservacao] = useState("")

    async function carregarLocalizacoes() {
        const resposta = await fetch(
            `http://127.0.0.1:5000/api/admin/viagens/${viagemId}/localizacoes`
        )

        const dados = await resposta.json()

        setLocalizacoes(dados)
    }

    async function salvarLocalizacao() {
        if (!localizacao) {
            alert("Informe a localização.")
            return
        }

        const resposta = await fetch(
            `http://127.0.0.1:5000/api/admin/viagens/${viagemId}/localizacoes`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    localizacao,
                    observacao,
                }),
            }
        )

        const dados = await resposta.json()

        alert(dados.mensagem)

        setLocalizacao("")
        setObservacao("")

        carregarLocalizacoes()
    }

    useEffect(() => {
        carregarLocalizacoes()
    }, [])

    return (
        <div className="grafico-card">
            <h2>Rastreamento da Viagem</h2>

            <div className="admin-form">
                <input
                    placeholder="Localização atual. Ex: Uberaba/MG"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                />

                <textarea
                    placeholder="Observação"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={3}
                />

                <button className="btn-primary" onClick={salvarLocalizacao}>
                    Registrar Localização
                </button>
            </div>

            <div className="timeline-rastreamento">
                {localizacoes.map((item) => (
                    <div
                        key={item.id}
                        className="timeline-item"
                    >
                        <div className="timeline-marker" />

                        <div className="timeline-content">
                            <strong>
                                {item.localizacao}
                            </strong>

                            <small>
                                {item.data_registro}
                            </small>

                            {item.observacao && (
                                <p>{item.observacao}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RastreamentoViagem