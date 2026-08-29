import { useEffect, useState } from "react"

import { Link } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"
import AdminHeader from "../components/layout/AdminHeader"
import { apiFetch } from "../services/api"

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
            const resposta = await apiFetch(
                "/api/admin/cargas"
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
        );

        if (!confirmar) {
            return;
        }

        try {
            const resposta = await apiFetch(
                `/api/admin/cargas/${id}`,
                {
                    method: "DELETE",
                }
            );

            const dados = await resposta.json().catch(() => null);

            if (!resposta.ok) {
                alert(
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível excluir a carga."
                );
                return;
            }

            alert(
                dados?.mensagem ||
                "Carga excluída com sucesso!"
            );

            setCargas((prev) =>
                prev.filter((carga) => carga.id !== id)
            );
        } catch {
            alert("Erro ao conectar com o servidor.");
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
            <div className="admin-page admin-cargas-page">
                <AdminHeader
                    title="Cargas"
                    subtitle="Gerencie as cargas da transportadora."
                >
                    <Link to="/admin/cargas/nova" className="btn-primary">
                        Nova Carga
                    </Link>
                </AdminHeader>

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
                        <div className="tabela-cargas admin-table-wrapper">
                            <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Cliente</th>
                                            <th>Status</th>
                                            <th>Local Atual</th>
                                            <th>Destino</th>
                                            <th>Motorista</th>
                                            <th>Veículo</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {cargasPaginadas.map((carga) => (
                                            <tr key={carga.id}>
                                                <td>{carga.codigo}</td>

                                                <td>{carga.cliente}</td>

                                                <td>
                                                    <span className={`status-badge status-${carga.status}`}>
                                                        {carga.status}
                                                    </span>
                                                </td>

                                                <td>{carga.local_atual}</td>

                                                <td>{carga.destino}</td>

                                                <td>
                                                    {carga.motorista || "Não atribuído"}
                                                </td>

                                                <td>
                                                    {carga.veiculo || "Não atribuído"}
                                                </td>

                                                <td>
                                                    <div className="acoes-carga admin-table-actions">
                                                        <Link
                                                            to={`/admin/cargas/${carga.id}`}
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
                                                            type="button"
                                                            className="btn-excluir"
                                                            onClick={() => excluirCarga(carga.id)}
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
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
