import { useEffect, useState } from "react"

import { Link } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"

type Carga = {
    id: number
    codigo: string
    cliente: string
    status: string
    local_atual: string
    destino: string
}

function AdminCargas() {
    const [cargas, setCargas] = useState<Carga[]>([])

    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState("")
    const [statusFiltro, setStatusFiltro] = useState("Todos")

    async function carregarCargas() {
        try {
            const resposta = await fetch(
                "http://127.0.0.1:5000/api/admin/cargas"
            )

            const dados = await resposta.json()

            setCargas(dados)

            setLoading(false)
        } catch {
            console.log("Erro ao carregar cargas.")

            setLoading(false)
        }
    }

    useEffect(() => {
        carregarCargas()
    }, [])

    const cargasFiltradas = cargas.filter((carga) => {
        const buscaEncontrada =
            carga.codigo.toLowerCase().includes(busca.toLowerCase()) ||
            carga.cliente.toLowerCase().includes(busca.toLowerCase())

        const statusEncontrado =
            statusFiltro === "Todos" || carga.status === statusFiltro

        return buscaEncontrada && statusEncontrado
    })

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Cargas</h1>

                        <p>
                            Gerenciamento operacional de cargas
                        </p>
                    </div>

                    <button className="btn-nova-carga">
                        Nova Carga
                    </button>
                </div>

                <div className="busca-box">
                    <input
                        type="text"
                        placeholder="Buscar carga ou cliente..."
                        value={busca}
                        onChange={(event) =>
                            setBusca(event.target.value)
                        }
                    />
                </div>

                <div className="filtro-status">
                    <button onClick={() => setStatusFiltro("Todos")}>Todos</button>
                    <button onClick={() => setStatusFiltro("Em coleta")}>Em coleta</button>
                    <button onClick={() => setStatusFiltro("Em trânsito")}>Em trânsito</button>
                    <button onClick={() => setStatusFiltro("Saiu para entrega")}>
                        Saiu para entrega
                    </button>
                    <button onClick={() => setStatusFiltro("Entregue")}>Entregue</button>
                </div>

                <p className="resultado-busca">
                    {cargasFiltradas.length} carga(s)
                    encontrada(s)
                </p>

                {loading ? (
                    <h2>Carregando...</h2>
                ) : (
                    <div className="tabela-cargas">
                        <table>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Cliente</th>
                                    <th>Status</th>
                                    <th>Local Atual</th>
                                    <th>Destino</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                    {cargasFiltradas.map((carga) => (
                                    <tr key={carga.id}>
                                        <td>{carga.codigo}</td>

                                        <td>{carga.cliente}</td>

                                        <td>
                                            <span
                                                className={`status status-${carga.status
                                                    .toLowerCase()
                                                    .replaceAll(" ", "-")}`}
                                            >
                                                {carga.status}
                                            </span>
                                        </td>

                                        <td>{carga.local_atual}</td>

                                        <td>{carga.destino}</td>

                                        <td>
                                            <Link to="/admin/cargas/nova" className="btn-nova-carga">
                                                Nova Carga
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminCargas