import { useEffect, useState } from "react"

type Alerta = {
    tipo: string
    mensagem: string
    nivel: string
}

function CentroAlertas() {
    const [alertas, setAlertas] = useState<Alerta[]>([])

    async function carregarAlertas() {
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/admin/alertas"
        )

        const dados = await resposta.json()

        setAlertas(dados)
    }

    useEffect(() => {
        carregarAlertas()
    }, [])

    return (
        <div className="grafico-card">
            <h2>Centro de Alertas</h2>

            {alertas.length === 0 ? (
                <p className="sem-alertas">
                    Nenhum alerta crítico no momento.
                </p>
            ) : (
                <div className="alertas-lista">
                    {alertas.map((alerta, index) => (
                        <div
                            key={index}
                            className={`alerta-item alerta-${alerta.nivel}`}
                        >
                            <strong>{alerta.tipo}</strong>
                            <span>{alerta.mensagem}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CentroAlertas