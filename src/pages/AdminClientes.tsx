import { useEffect, useState } from "react"

import AdminLayout from "../components/admin/AdminLayout"
import { Link } from "react-router-dom"

type Cliente = {
    id: number
    razao_social: string
    nome_fantasia: string
    documento: string
    responsavel: string
    email: string
    telefone: string
    cidade: string
    estado: string
    ativo: boolean
}

function AdminClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([])

    async function carregarClientes() {
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/admin/clientes"
        )

        const dados = await resposta.json()

        setClientes(dados)
    }

    useEffect(() => {
        carregarClientes()
    }, [])

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Clientes</h1>

                        <p>
                            Gerenciamento de clientes da transportadora
                        </p>
                    </div>
                    <Link
                        to="/admin/clientes/novo"
                        className="btn-nova-carga"
                    >
                        Novo Cliente
                    </Link>
                </div>

                <div className="tabela-cargas">
                    <table>
                        <thead>
                            <tr>
                                <th>Razão Social</th>
                                <th>Responsável</th>
                                <th>Telefone</th>
                                <th>Cidade</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td>{cliente.razao_social}</td>

                                    <td>{cliente.responsavel}</td>

                                    <td>{cliente.telefone}</td>

                                    <td>
                                        {cliente.cidade}/{cliente.estado}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                cliente.ativo
                                                    ? "status status-entregue"
                                                    : "status status-atrasada"
                                            }
                                        >
                                            {cliente.ativo
                                                ? "Ativo"
                                                : "Inativo"}
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

export default AdminClientes