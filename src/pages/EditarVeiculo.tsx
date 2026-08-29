import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"
import { buscarUsuarioLogado } from "../services/authService"

function EditarVeiculo() {
    const { id } = useParams()

    const navigate = useNavigate()
    const usuario = buscarUsuarioLogado()
    const perfil = usuario?.perfil?.trim().toLowerCase()
    const administrador = perfil === "administrador"
    const operador = perfil === "operador"

    const [placa, setPlaca] = useState("")
    const [modelo, setModelo] = useState("")
    const [marca, setMarca] = useState("")
    const [tipo, setTipo] = useState("")
    const [ano, setAno] = useState("")
    const [capacidade, setCapacidade] = useState("")
    const [status, setStatus] = useState("Disponível")
    const [statusOriginal, setStatusOriginal] = useState("Disponível")
    const veiculoInativo = statusOriginal.trim().toLowerCase() === "inativo"
    const podeEditarStatus = administrador || (operador && !veiculoInativo)

    async function carregarVeiculo() {
        const resposta = await apiFetch(
            `/api/admin/veiculos/${id}`
        )

        const dados = await resposta.json()

        setPlaca(dados.placa || "")
        setModelo(dados.modelo || "")
        setMarca(dados.marca || "")
        setTipo(dados.tipo || "")
        setAno(dados.ano || "")
        setCapacidade(dados.capacidade || "")
        const statusCarregado = dados.status || "Disponível"
        setStatus(statusCarregado)
        setStatusOriginal(statusCarregado)
    }

    useEffect(() => {
        carregarVeiculo()
    }, [])

    async function salvarVeiculo() {
        await apiFetch(
            `/api/admin/veiculos/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    placa,
                    modelo,
                    marca,
                    tipo,
                    ano,
                    capacidade,
                    ...(podeEditarStatus
                        ? { status }
                        : {}),
                }),
            }
        )

        alert("Veículo atualizado com sucesso!")

        navigate("/admin/veiculos")
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1>Editar Veículo</h1>

                <form
                    className="admin-form admin-form-card admin-form-grid"
                    onSubmit={(e) => {
                        e.preventDefault()
                        salvarVeiculo()
                    }}
                >
                    <div className="linha-input">
                        <label>Placa</label>

                        <input
                            value={placa}
                            onChange={(e) => setPlaca(e.target.value)}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Modelo</label>

                        <input
                            value={modelo}
                            onChange={(e) => setModelo(e.target.value)}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Marca</label>

                        <input
                            value={marca}
                            onChange={(e) => setMarca(e.target.value)}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Tipo</label>

                        <input
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Ano</label>

                        <input
                            value={ano}
                            onChange={(e) => setAno(e.target.value)}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Capacidade</label>

                        <input
                            value={capacidade}
                            onChange={(e) => setCapacidade(e.target.value)}
                        />
                    </div>

                    {podeEditarStatus && (
                        <div className="linha-input">
                            <label>Status</label>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option>Disponível</option>
                                <option>Em viagem</option>
                                <option>Manutenção</option>
                                {administrador && <option>Inativo</option>}
                            </select>
                        </div>
                    )}

                    {operador && veiculoInativo && (
                        <div className="linha-input">
                            <label>Status</label>
                            <input value="Inativo" disabled />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-nova-carga"
                    >
                        Salvar Alterações
                    </button>
                </form>
            </div>

        </AdminLayout>
    )
}

export default EditarVeiculo
