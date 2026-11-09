import { useState } from "react"
import AdminLayout from "../components/admin/AdminLayout"
import { Link } from "react-router-dom"
import { apiFetch } from "../services/api"

type ResultadoCarga = { id: number; codigo: string; cliente: string; status: string }
type ResultadoMotorista = { id: number; nome: string }
type ResultadoVeiculo = { id: number; placa: string; modelo: string }
type ResultadoBusca = {
    cargas: ResultadoCarga[]
    motoristas: ResultadoMotorista[]
    veiculos: ResultadoVeiculo[]
}

function AdminBusca() {
    const [termo, setTermo] = useState("")
    const [resultado, setResultado] = useState<ResultadoBusca | null>(null)

    async function buscar() {
        const resposta = await apiFetch(
            `/api/admin/busca?q=${termo}`
        )

        const dados = await resposta.json()
        setResultado(dados)
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Pesquisa Global</h1>
                        <p>Busque cargas, motoristas e veículos</p>
                    </div>
                </div>

                <div className="busca-box">
                    <input
                        placeholder="Digite código, cliente, motorista ou veículo..."
                        value={termo}
                        onChange={(e) => setTermo(e.target.value)}
                    />

                    <button className="btn-nova-carga" onClick={buscar}>
                        Buscar
                    </button>
                </div>

                {resultado && (
                    <div className="tabela-cargas">
                        <h2>Resultados</h2>

                        <h3>Cargas</h3>
                        {resultado.cargas.map((carga) => (
                            <Link
                                key={carga.id}
                                to={`/admin/cargas/${carga.id}`}
                                className="resultado-link"
                            >
                                📦 {carga.codigo} - {carga.cliente} - {carga.status}
                            </Link>
                        ))}

                        <h3>Motoristas</h3>
                        {resultado.motoristas.map((motorista) => (
                            <Link
                                key={motorista.id}
                                to={`/admin/motorista/${motorista.id}`}
                                className="resultado-link"
                            >
                                👨‍✈️ {motorista.nome}
                            </Link>
                        ))}
                        <h3>Veículos</h3>
                        {resultado.veiculos.map((veiculo) => (
                            <Link
                                key={veiculo.id}
                                to={`/admin/veiculo/${veiculo.id}`}
                                className="resultado-link"
                            >
                                🚛 {veiculo.placa} - {veiculo.modelo}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminBusca
