import { useEffect, useState } from "react"

import AdminLayout from "../components/admin/AdminLayout"
import { Link } from "react-router-dom"

type Veiculo = {
    id: number
    placa: string
    modelo: string
    marca: string
    tipo: string
    ano: string
    capacidade: string
    status: string
}

function AdminVeiculos() {
    const [veiculos, setVeiculos] = useState<Veiculo[]>([])

    async function carregarVeiculos() {
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/admin/veiculos"
        )

        const dados = await resposta.json()

        setVeiculos(dados)
    }

    useEffect(() => {
        carregarVeiculos()
    }, [])

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Veículos</h1>

                        <p>
                            Gerenciamento da frota da transportadora
                        </p>
                    </div>

                    <Link
                        to="/admin/veiculos/novo"
                        className="btn-nova-carga"
                    >
                        Novo Veículo
                    </Link>
                </div>

                <div className="tabela-cargas">
                    <table>
                        <thead>
                            <tr>
                                <th>Placa</th>
                                <th>Modelo</th>
                                <th>Marca</th>
                                <th>Tipo</th>
                                <th>Ano</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {veiculos.map((veiculo) => (
                                <tr key={veiculo.id}>
                                    <td>{veiculo.placa}</td>
                                    <td>{veiculo.modelo}</td>
                                    <td>{veiculo.marca}</td>
                                    <td>{veiculo.tipo}</td>
                                    <td>{veiculo.ano}</td>
                                    <td>
                                        <span className="status status-entregue">
                                            {veiculo.status}
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

export default AdminVeiculos