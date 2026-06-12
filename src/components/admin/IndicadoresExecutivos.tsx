import { useEffect, useState } from "react"

type Indicadores = {
    ticket_medio: number
    percentual_entregues: number
    percentual_frota_ativa: number
}

function IndicadoresExecutivos() {
    const [indicadores, setIndicadores] = useState<Indicadores | null>(null)

    async function carregarIndicadores() {
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/admin/indicadores"
        )

        const dados = await resposta.json()

        setIndicadores(dados)
    }

    useEffect(() => {
        carregarIndicadores()
    }, [])

    function formatarMoeda(valor: number) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })
    }

    return (
        <div className="cards-dashboard">
            <div className="card-dashboard card-indicador card-entregues">
                <h3>Taxa de Entrega</h3>
                <strong>{indicadores?.percentual_entregues || 0}%</strong>
            </div>

            <div className="barra-progresso">
                <div
                    className="barra-preenchida"
                    style={{
                        width: `${indicadores?.percentual_entregues || 0}%`
                    }}
                />
            </div>

            <div className="card-dashboard card-indicador card-cotacoes">
                <h3>Ticket Médio</h3>
                <strong>{formatarMoeda(indicadores?.ticket_medio || 0)}</strong>
            </div>

            <div className="card-dashboard card-indicador card-transito">
                <h3>Frota Ativa</h3>
                <strong>{indicadores?.percentual_frota_ativa || 0}%</strong>
            </div>
        </div>
    )
}

export default IndicadoresExecutivos