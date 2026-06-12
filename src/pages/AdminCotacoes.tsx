import { useEffect, useState } from "react"
import AdminLayout from "../components/admin/AdminLayout"

type Cotacao = {
    id: number
    cliente: string
    whatsapp: string
    origem: string
    destino: string
    tipo_carga: string
    observacoes: string
    data_criacao: string
}

function AdminCotacoes() {
    const [cotacoes, setCotacoes] = useState<Cotacao[]>([])

    async function carregarCotacoes() {
        const resposta = await fetch("http://127.0.0.1:5000/api/admin/cotacoes")
        const dados = await resposta.json()
        setCotacoes(dados)
    }

    useEffect(() => {
        carregarCotacoes()
    }, [])

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Cotações</h1>
                        <p>Solicitações recebidas pelo site</p>
                    </div>
                </div>

                <div className="tabela-cargas">
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>WhatsApp</th>
                                <th>Origem</th>
                                <th>Destino</th>
                                <th>Carga</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cotacoes.map((cotacao) => (
                                <tr key={cotacao.id}>
                                    <td>{cotacao.cliente}</td>
                                    <td>{cotacao.whatsapp}</td>
                                    <td>{cotacao.origem}</td>
                                    <td>{cotacao.destino}</td>
                                    <td>{cotacao.tipo_carga}</td>
                                    <td>{cotacao.data_criacao}</td>

                                    <td>
                                        <a
                                            className="btn-whatsapp"
                                            href={`https://wa.me/55${cotacao.whatsapp}`}
                                            target="_blank"
                                        >
                                            Chamar
                                        </a>
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

export default AdminCotacoes