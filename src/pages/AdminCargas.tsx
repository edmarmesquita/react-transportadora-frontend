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
    motorista: string
    veiculo: string
}

function AdminCargas() {
    const [cargas, setCargas] = useState<Carga[]>([])

    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState("")
    const [statusFiltro, setStatusFiltro] = useState("Todos")
    const [paginaAtual, setPaginaAtual] = useState(1)

    const cargasPorPagina = 5  

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

    async function excluirCarga(id: number) {
        const confirmar = window.confirm(
            "Tem certeza que deseja excluir esta carga?"
        )

        if (!confirmar) {
            return
        }

        try {
            const resposta = await fetch(
                `http://127.0.0.1:5000/api/admin/cargas/${id}`,
                {
                    method: "DELETE",
                }
            )

            if (!resposta.ok) {
                alert("Erro ao excluir carga.")
                return
            }

            setCargas((prev) =>
                prev.filter((carga) => carga.id !== id)
            )
        } catch {
            alert("Erro ao conectar com o servidor.")
        }
    }

    const indiceInicial =
        (paginaAtual - 1) * cargasPorPagina

    const indiceFinal =
        indiceInicial + cargasPorPagina

    const cargasPaginadas =
        cargasFiltradas.slice(
            indiceInicial,
            indiceFinal
        )

    const totalPaginas = Math.ceil(
        cargasFiltradas.length / cargasPorPagina
    )

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

                    <Link
                        to="/admin/cargas/nova"
                        className="btn-nova-carga"
                    >
                        Nova Carga
                    </Link>
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
                    <>
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
                                        <th>Motorista</th>
                                        <th>Veículo</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {cargasPaginadas.map((carga) => (
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
                                            <td>{carga.motorista || "Não definido"}</td>
                                            <td>{carga.veiculo || "Não definido"}</td>

                                            <td className="acoes-carga">
                                                <Link
                                                    to={`/admin/carga/${carga.id}`}
                                                    className="btn-detalhes"
                                                >
                                                    Detalhes
                                                </Link>

                                                <Link
                                                    to={`/admin/cargas/editar/${carga.id}`}
                                                    className="btn-editar"
                                                >
                                                    Editar
                                                </Link>

                                                <button
                                                    className="btn-excluir"
                                                    onClick={() => excluirCarga(carga.id)}
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPaginas > 1 && (
                            <div className="paginacao">
                                <button
                                    onClick={() =>
                                        setPaginaAtual((prev) => Math.max(prev - 1, 1))
                                    }
                                >
                                    Anterior
                                </button>

                                <span>
                                    Página {paginaAtual} de {totalPaginas}
                                </span>

                                <button
                                    onClick={() =>
                                        setPaginaAtual((prev) =>
                                            Math.min(prev + 1, totalPaginas)
                                        )
                                    }
                                >
                                    Próxima
                                </button>
                            </div>
                        )}

                    </>
                )}
            
            </div>
         
        </AdminLayout>
    )}


export default AdminCargas