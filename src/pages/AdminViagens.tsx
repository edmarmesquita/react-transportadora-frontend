import { useEffect, useState } from "react"

import AdminLayout from "../components/admin/AdminLayout"
import { Link } from "react-router-dom"

type Viagem = {
    id: number
    codigo_carga: string
    cliente: string
    motorista: string
    veiculo: string
    origem: string
    destino: string
    status: string
    data_criacao: string
}

function AdminViagens() {
    const [viagens, setViagens] = useState<Viagem[]>([])

    async function carregarViagens() {
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/admin/viagens"
        )

        const dados = await resposta.json()

        setViagens(dados)
    }

    useEffect(() => {
        carregarViagens()
    }, [])

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Viagens</h1>

                        <p>
                            Controle operacional de viagens da transportadora
                        </p>
                    </div>

                    <Link
                        to="/admin/viagens/nova"
                        className="btn-nova-carga"
                    >
                        Nova Viagem
                    </Link>
                </div>

                <div className="tabela-cargas">
                    <table>
                        <thead>
                            <tr>
                                <th>Carga</th>
                                <th>Cliente</th>
                                <th>Motorista</th>
                                <th>Veículo</th>
                                <th>Origem</th>
                                <th>Destino</th>
                                <th>Status</th>
                                <th>Criada em</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {viagens.map((viagem) => (
                                <tr key={viagem.id}>
                                    <td>{viagem.codigo_carga}</td>
                                    <td>{viagem.cliente}</td>
                                    <td>{viagem.motorista || "Não definido"}</td>
                                    <td>{viagem.veiculo || "Não definido"}</td>
                                    <td>{viagem.origem}</td>
                                    <td>{viagem.destino}</td>
                                    <td>{viagem.data_criacao}</td>

                                    <td>
                                        <Link
                                            to={`/admin/viagens/${viagem.id}`}
                                            className="btn-detalhes"
                                        >
                                            Detalhes
                                        </Link>
                                    </td>
                                    
                                    <td>
                                        <span
                                            className={`status status-${viagem.status
                                                .toLowerCase()
                                                .replaceAll(" ", "-")}`}
                                        >
                                            {viagem.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminViagens