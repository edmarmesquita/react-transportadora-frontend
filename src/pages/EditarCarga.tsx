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
    })

    const [erro, setErro] = useState("")
    const [loading, setLoading] = useState(true)
    const [salvando, setSalvando] = useState(false)

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
                        {salvando ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default EditarCarga