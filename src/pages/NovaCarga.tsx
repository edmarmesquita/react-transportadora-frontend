import { useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"

function NovaCarga() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        codigo: "",
        cliente: "",
        status: "Em coleta",
        local_atual: "",
        destino: "",
    })

    const [erro, setErro] = useState("")
    const [loading, setLoading] = useState(false)

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
        setLoading(true)

        try {
            const resposta = await fetch(
                "http://127.0.0.1:5000/api/admin/cargas",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                setErro(dados.erro || "Erro ao criar carga.")
                setLoading(false)
                return
            }

            navigate("/admin/cargas")
        } catch {
            setErro("Erro ao conectar com o servidor.")
            setLoading(false)
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Nova Carga</h1>
                        <p>Cadastro operacional de nova carga</p>
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

                    {erro && <p className="mensagem-erro">{erro}</p>}

                    <button className="btn-nova-carga" type="submit">
                        {loading ? "Salvando..." : "Salvar Carga"}
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default NovaCarga