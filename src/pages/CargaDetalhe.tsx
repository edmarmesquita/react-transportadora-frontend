import { useEffect, useState } from "react"

import { useParams } from "react-router-dom"

type Carga = {
    id: number
    codigo: string
    cliente: string
    status: string
    local_atual: string
    destino: string
    ultima_atualizacao: string
}

function CargaDetalhe() {
    const { id } = useParams()

    const [carga, setCarga] =
        useState<Carga | null>(null)

    const [loading, setLoading] = useState(true)

    async function carregarCarga() {
        try {
            const resposta = await fetch(
                `http://127.0.0.1:5000/api/carga/${id}`
            )

            const dados = await resposta.json()

            setCarga(dados)

            setLoading(false)
        } catch {
            console.log("Erro ao carregar carga.")

            setLoading(false)
        }
    }

    useEffect(() => {
        carregarCarga()
    }, [])

    if (loading) {
        return <h1>Carregando carga...</h1>
    }

    return (
        <div className="carga-detalhe-page">
            <h1>Detalhes da Carga</h1>

            <div className="carga-box">
                <p>
                    <strong>Código:</strong>{" "}
                    {carga?.codigo}
                </p>

                <p>
                    <strong>Cliente:</strong>{" "}
                    {carga?.cliente}
                </p>

                <p>
                    <strong>Status:</strong>{" "}
                    {carga?.status}
                </p>

                <p>
                    <strong>Local Atual:</strong>{" "}
                    {carga?.local_atual}
                </p>

                <p>
                    <strong>Destino:</strong>{" "}
                    {carga?.destino}
                </p>

                <p>
                    <strong>Última atualização:</strong>{" "}
                    {carga?.ultima_atualizacao}
                </p>
            </div>
        </div>
    )
}

export default CargaDetalhe