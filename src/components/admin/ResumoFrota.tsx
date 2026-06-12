import { useEffect, useState } from "react"

type FrotaResumo = {
    disponiveis: number
    em_viagem: number
    manutencao: number
}

function ResumoFrota() {
    const [resumo, setResumo] = useState<FrotaResumo | null>(null)

    async function carregarResumo() {
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/admin/frota/resumo"
        )

        const dados = await resposta.json()

        setResumo(dados)
    }

    useEffect(() => {
        carregarResumo()
    }, [])

    return (
        <div className="grafico-card">
            <h2>Utilização da Frota</h2>

            <div className="frota-resumo">
                <div>
                    <strong>{resumo?.disponiveis || 0}</strong>
                    <span>Disponíveis</span>
                </div>

                <div>
                    <strong>{resumo?.em_viagem || 0}</strong>
                    <span>Em viagem</span>
                </div>

                <div>
                    <strong>{resumo?.manutencao || 0}</strong>
                    <span>Manutenção</span>
                </div>
            </div>
        </div>
    )
}

export default ResumoFrota