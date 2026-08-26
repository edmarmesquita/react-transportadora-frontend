import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"

type ClienteTop = {
    cliente: string
    total: number
}

function TopClientes() {
    const [clientes, setClientes] = useState<ClienteTop[]>([])

    async function carregarClientes() {
        const resposta = await apiFetch(
            "/api/admin/clientes/top-cargas"
        )

        const dados = await resposta.json()

        setClientes(dados)
    }

    useEffect(() => {
        carregarClientes()
    }, [])

    return (
        <div className="dashboard-bloco">
            <h2>🏆 Top 5 Clientes</h2>

            <div className="ranking-lista">
                {clientes.map((cliente, index) => (
                    <div className="ranking-item" key={cliente.cliente}>
                        <strong>{index + 1}º</strong>

                        <span>{cliente.cliente}</span>

                        <small>
                            {cliente.total} carga(s)
                        </small>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TopClientes