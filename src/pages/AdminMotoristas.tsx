import { useEffect, useState } from "react"

import AdminLayout from "../components/admin/AdminLayout"
import { Link } from "react-router-dom"

type Motorista = {
    id: number
    nome: string
    cpf: string
    cnh: string
    categoria_cnh: string
    telefone: string
    email: string
    status: string
}

function AdminMotoristas() {
    const [motoristas, setMotoristas] = useState<Motorista[]>([])

    async function carregarMotoristas() {
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/admin/motoristas"
        )

        const dados = await resposta.json()

        setMotoristas(dados)
    }

    useEffect(() => {
        carregarMotoristas()
    }, [])

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Motoristas</h1>

                        <p>
                            Gerenciamento operacional de motoristas
                        </p>
                    </div>

                    <Link
                        to="/admin/motoristas/novo"
                        className="btn-nova-carga"
                    >
                        Novo Motorista
                    </Link>
                </div>

                <div className="tabela-cargas">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>CNH</th>
                                <th>Categoria</th>
                                <th>Telefone</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {motoristas.map((motorista) => (
                                <tr key={motorista.id}>
                                    <td>{motorista.nome}</td>

                                    <td>{motorista.cpf}</td>

                                    <td>{motorista.cnh}</td>

                                    <td>{motorista.categoria_cnh}</td>

                                    <td>{motorista.telefone}</td>

                                    <td>
                                        <span className="status status-entregue">
                                            {motorista.status}
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

export default AdminMotoristas