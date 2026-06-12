import { useEffect, useState } from "react"

type MotoristaRanking = {
    nome: string
    total_viagens: number
}

function RankingMotoristas() {
    const [ranking, setRanking] = useState<MotoristaRanking[]>([])

    async function carregarRanking() {
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/admin/ranking-motoristas"
        )

        const dados = await resposta.json()

        setRanking(dados)
    }

    useEffect(() => {
        carregarRanking()
    }, [])

    return (
        <div className="grafico-card">
            <h2>Ranking de Motoristas</h2>

            <div className="ranking-lista">
                {ranking.map((motorista, index) => (
                    <div className="ranking-item" key={motorista.nome}>
                        <strong>{index + 1}º</strong>

                        <span>{motorista.nome}</span>

                        <small>
                            {motorista.total_viagens} viagem(ns)
                        </small>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RankingMotoristas