import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"

type RotaTop = {
    rota: string
    total: number
}

function TopRotas() {
    const [rotas, setRotas] = useState<RotaTop[]>([])

    async function carregarRotas() {
        const resposta = await apiFetch(
            "/api/admin/top-rotas"
        )

        const dados = await resposta.json()

        setRotas(dados)
    }

    useEffect(() => {
        carregarRotas()
    }, [])

    return (
        <div className="grafico-card">
            <h2>🛣️ Top Rotas</h2>

            <div className="ranking-lista">
                {rotas.map((rota, index) => (
                    <div className="ranking-item" key={rota.rota}>
                        <strong>{index + 1}º</strong>

                        <span>{rota.rota}</span>

                        <small>{rota.total} viagem(ns)</small>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TopRotas