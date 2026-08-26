import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"

type Financeiro = {
    faturamento_total: number
    total_pago: number
    total_pendente: number
}

function ResumoFinanceiro() {
    const [financeiro, setFinanceiro] = useState<Financeiro | null>(null)

    async function carregarFinanceiro() {
        const resposta = await apiFetch(
            "/api/admin/financeiro/resumo"
        )

        const dados = await resposta.json()

        setFinanceiro(dados)
    }

    useEffect(() => {
        carregarFinanceiro()
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
            <div className="card-dashboard card-financeiro card-cotacoes">
                <h3>Faturamento Total</h3>
                <strong>{formatar(financeiro?.faturamento_total || 0)}</strong>
            </div>

            <div className="card-dashboard card-financeiro card-entregues">
                <h3>Total Pago</h3>
                <strong>{formatar(financeiro?.total_pago || 0)}</strong>
            </div>

            <div className="card-dashboard card-financeiro card-transito">
                <h3>Total Pendente</h3>
                <strong>{formatar(financeiro?.total_pendente || 0)}</strong>
            </div>
        </div>
    )
}

export default ResumoFinanceiro