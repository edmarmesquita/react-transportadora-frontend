import { useState } from "react"
import AdminLayout from "../components/admin/AdminLayout"
import { Link } from "react-router-dom"

function AdminBusca() {
    const [termo, setTermo] = useState("")
    const [resultado, setResultado] = useState<any>(null)

    async function buscar() {
        const resposta = await fetch(
            `http://127.0.0.1:5000/api/admin/busca?q=${termo}`
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
                        {resultado.cargas.map((carga: any) => (
                            <Link
                                key={carga.id}
                                to={`/admin/carga/${carga.id}`}
                                className="resultado-link"
                            >
                                📦 {carga.codigo} - {carga.cliente} - {carga.status}
                            </Link>
                        ))}

                        <h3>Motoristas</h3>
                        {resultado.motoristas.map((motorista: any) => (
                            <Link
                                key={motorista.id}
                                to={`/admin/motorista/${motorista.id}`}
                                className="resultado-link"
                            >
                                👨‍✈️ {motorista.nome}
                            </Link>
                        ))}
                        <h3>Veículos</h3>
                        {resultado.veiculos.map((veiculo: any) => (
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