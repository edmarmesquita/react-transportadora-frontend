import { useEffect, useState } from "react"
import { CartesianGrid } from "recharts"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { apiFetch } from "../../services/api"

type EvolucaoViagem = {
    mes: string
    total: number
}

function GraficoViagens() {
    const [dados, setDados] = useState<EvolucaoViagem[]>([])

    async function carregarDados() {
        const resposta = await apiFetch(
            "/api/admin/viagens/evolucao"
        )

        const dadosApi = await resposta.json()

        setDados(dadosApi)
    }

    useEffect(() => {
        carregarDados()
    }, [])

    return (
        <div className="grafico-card">
            <h2>Evolução das Viagens</h2>

            <div className="grafico-area">
                <CartesianGrid strokeDasharray="3 3" />
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dados}>
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip
                            formatter={(value) => [`${value} viagem(ns)`, "Total"]}
                        />

                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#e60000"
                            strokeWidth={4}
                            dot={{ r: 6 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default GraficoViagens