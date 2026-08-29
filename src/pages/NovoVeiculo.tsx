import { useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"

function NovoVeiculo() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        placa: "",
        modelo: "",
        marca: "",
        tipo: "",
        ano: "",
        capacidade: "",
        status: "Disponível",
    })

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

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        try {
            const resposta = await apiFetch(
                "/api/admin/veiculos",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            )

            if (!resposta.ok) {
                alert("Erro ao cadastrar veículo.")
                return
            }

            navigate("/admin/veiculos")
        } catch {
            alert("Erro ao conectar com servidor.")
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Novo Veículo</h1>

                        <p>
                            Cadastro de veículo da frota
                        </p>
                    </div>
                </div>

                <form
                    className="admin-form admin-form-card admin-form-grid"
                    onSubmit={handleSubmit}
                >
                    <div className="linha-input">
                        <label>Placa</label>

                        <input
                            name="placa"
                            value={formData.placa}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Modelo</label>

                        <input
                            name="modelo"
                            value={formData.modelo}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Marca</label>

                        <input
                            name="marca"
                            value={formData.marca}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Tipo</label>

                        <input
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Ano</label>

                        <input
                            name="ano"
                            value={formData.ano}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Capacidade</label>

                        <input
                            name="capacidade"
                            value={formData.capacidade}
                            onChange={handleChange}
                        />
                    </div>
                        
                    <div className="linha-input">
                        <label>Status</label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option>Disponível</option>
                            <option>Em viagem</option>
                            <option>Manutenção</option>
                        </select>
                    </div>

                    <button
                        className="btn-nova-carga"
                        type="submit"
                    >
                        Salvar Veículo
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default NovoVeiculo
