import { useEffect, useState } from "react"

type Financeiro = {
    faturamento_total: number
    total_pago: number
    total_pendente: number
}

function ResumoFinanceiro() {
    const [financeiro, setFinanceiro] = useState<Financeiro | null>(null)

    async function carregarFinanceiro() {
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/admin/financeiro/resumo"
        )

        const dados = await resposta.json()

        setFinanceiro(dados)
    }

    useEffect(() => {
        carregarFinanceiro()
    }, [])

    function formatar(valor: number) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })
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