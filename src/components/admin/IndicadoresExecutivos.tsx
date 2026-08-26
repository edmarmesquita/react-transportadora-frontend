import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"

type Indicadores = {
    ticket_medio: number
    percentual_entregues: number
    percentual_frota_ativa: number
}

function IndicadoresExecutivos() {
    const [indicadores, setIndicadores] = useState<Indicadores | null>(null)

    async function carregarIndicadores() {
        const resposta = await apiFetch(
            "/api/admin/indicadores"
        )

        const dados = await resposta.json()

        setIndicadores(dados)
    }

    useEffect(() => {
        carregarIndicadores()
    }, [])

    function formatar(valor: number) {
        if (valor >= 1000000) {
            return `R$ ${(valor / 1000000).toFixed(1).replace(".", ",")} mi`
        }

        if (valor >= 1000) {
            return `R$ ${(valor / 1000).toFixed(1).replace(".", ",")} mil`
        }

        return `R$ ${valor.toFixed(2).replace(".", ",")}`
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
                <strong>{formatar(indicadores?.ticket_medio || 0)}</strong>
            </div>

            <div className="card-dashboard card-indicador card-transito">
                <h3>Frota Ativa</h3>
                <strong>{indicadores?.percentual_frota_ativa || 0}%</strong>
            </div>
        </div>
    )
}

export default IndicadoresExecutivos