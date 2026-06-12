import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

type GraficoStatusProps = {
    emColeta: number
    emTransito: number
    saiuEntrega: number
    entregues: number
}

function GraficoStatus({
    emColeta,
    emTransito,
    saiuEntrega,
    entregues,
}: GraficoStatusProps) {
    const dados = [
        { name: "Coleta", value: emColeta, fill: "#ffc107" },
        { name: "Trânsito", value: emTransito, fill: "#0d6efd" },
        { name: "Entrega", value: saiuEntrega, fill: "#fd7e14" },
        { name: "Entregues", value: entregues, fill: "#198754" },
    ]

    return (
        <div className="grafico-card">
            <h2>Status das Cargas</h2>

            <div className="grafico-area">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dados}>
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />

                        <Bar
                            dataKey="value"
                            fill="#e60000"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default GraficoStatus