import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"

function EditarCarga() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        codigo: "",
        cliente: "",
        status: "",
        local_atual: "",
        destino: "",
        motorista_id: "",
        veiculo_id: "",
        valor_frete: "",
        status_pagamento: "Pendente"
    })

    const [erro, setErro] = useState("")
    const [loading, setLoading] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [motoristas, setMotoristas] = useState([])
    const [veiculos, setVeiculos] = useState([])

    async function carregarOpcoes() {
        const respostaMotoristas = await fetch(
            "http://127.0.0.1:5000/api/admin/motoristas"
        )

        const dadosMotoristas = await respostaMotoristas.json()

        const respostaVeiculos = await fetch(
            "http://127.0.0.1:5000/api/admin/veiculos"
        )

        const dadosVeiculos = await respostaVeiculos.json()

        setMotoristas(dadosMotoristas)
        setVeiculos(dadosVeiculos)
    }


    async function carregarCarga() {
        try {
            const resposta = await fetch(
                `http://127.0.0.1:5000/api/carga/${id}`
            )

            const dados = await resposta.json()

            setFormData({
                codigo: dados.codigo,
                cliente: dados.cliente,
                status: dados.status,
                local_atual: dados.local_atual,
                destino: dados.destino,
                motorista_id: dados.motorista_id ? String(dados.motorista_id) : "",
                veiculo_id: dados.veiculo_id ? String(dados.veiculo_id) : "",
                valor_frete: dados.valor_frete || "",
                status_pagamento: dados.status_pagamento || "Pendente",
            })

            setLoading(false)
        } catch {
            setErro("Erro ao carregar carga.")
            setLoading(false)
        }
    }

    function handleChange(
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLSelectElement>
    ) {
        const { name, value } = event.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        setErro("")
        setSalvando(true)

        try {
            const resposta = await fetch(
                `http://127.0.0.1:5000/api/admin/cargas/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                setErro(dados.erro || "Erro ao atualizar carga.")
                setSalvando(false)
                return
            }

            navigate("/admin/cargas")
        } catch {
            setErro("Erro ao conectar com o servidor.")
            setSalvando(false)
        }
    }

    useEffect(() => {
        carregarCarga()
        carregarOpcoes()
    }, [])

    if (loading) {
        return (
            <AdminLayout>
                <div className="admin-page">
                    <h2>Carregando carga...</h2>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Editar Carga</h1>
                        <p>Atualize os dados operacionais da carga</p>
                    </div>
                </div>

                <form className="admin-form" onSubmit={handleSubmit}>
                    <div className="linha-input">
                        <label>Código</label>
                        <input
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label>Cliente</label>
                        <input
                            name="cliente"
                            value={formData.cliente}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option>Em coleta</option>
                            <option>Em trânsito</option>
                            <option>Saiu para entrega</option>
                            <option>Entregue</option>
                        </select>
                    </div>

                    <select
                        name="motorista_id"
                        value={formData.motorista_id}
                        onChange={handleChange}
                    >
                        <option value="">Selecione o motorista</option>

                        {motoristas.map((motorista: any) => (
                            <option key={motorista.id} value={motorista.id}>
                                {motorista.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        name="veiculo_id"
                        value={formData.veiculo_id}
                        onChange={handleChange}
                    >
                        <option value="">Selecione o veículo</option>

                        {veiculos.map((veiculo: any) => (
                            <option key={veiculo.id} value={veiculo.id}>
                                {veiculo.placa} - {veiculo.modelo}
                            </option>
                        ))}
                    </select>

                    <div className="linha-input">
                        <label>Local atual</label>
                        <input
                            name="local_atual"
                            value={formData.local_atual}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label>Destino</label>
                        <input
                            name="destino"
                            value={formData.destino}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label>Valor do frete</label>

                        <input
                            name="valor_frete"
                            value={formData.valor_frete}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Status do pagamento</label>

                        <select
                            name="status_pagamento"
                            value={formData.status_pagamento}
                            onChange={handleChange}
                        >
                            <option>Pendente</option>
                            <option>Pago</option>
                        </select>
                    </div>

                    {erro && <p className="mensagem-erro">{erro}</p>}

                    <button className="btn-nova-carga" type="submit">
                        {salvando ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default EditarCarga