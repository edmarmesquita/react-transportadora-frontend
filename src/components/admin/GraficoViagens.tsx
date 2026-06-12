import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

const dados = [
    { mes: "Jan", viagens: 12 },
    { mes: "Fev", viagens: 19 },
    { mes: "Mar", viagens: 15 },
    { mes: "Abr", viagens: 24 },
    { mes: "Mai", viagens: 30 },
]

function GraficoViagens() {
    return (
        <div className="grafico-card">
            <h2>Evolução das Viagens</h2>

            <div className="grafico-area">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dados}>
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="viagens"
                            stroke="#e60000"
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default GraficoViagens