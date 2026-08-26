import { useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"

function NovoCliente() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        razao_social: "",
        nome_fantasia: "",
        documento: "",
        responsavel: "",
        email: "",
        telefone: "",
        cidade: "",
        estado: "",
    })

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement>
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
                "/api/admin/clientes",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            )

            if (!resposta.ok) {
                alert("Erro ao cadastrar cliente.")
                return
            }

            navigate("/admin/clientes")
        } catch {
            alert("Erro ao conectar com servidor.")
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Novo Cliente</h1>

                        <p>
                            Cadastro de cliente da transportadora
                        </p>
                    </div>
                </div>

                <form
                    className="admin-form"
                    onSubmit={handleSubmit}
                >
                    <div className="linha-input">
                        <label>razão Social</label>

                        <input
                            name="razao_social"
                            value={formData.razao_social}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>nome Fantasia</label>

                        <input
                            name="nome_fantasia"
                            value={formData.nome_fantasia}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>CNPJ/CPF</label>

                        <input
                            name="documento"
                            value={formData.documento}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>responsável</label>

                        <input
                            name="responsavel"
                            value={formData.responsavel}
                            onChange={handleChange}
                        />
                    </div>

                  
                    <div className="linha-input">
                        <label>email</label>

                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>telefone</label>

                        <input
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>cidade</label>

                        <input
                            name="cidade"
                            value={formData.cidade}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>estado</label>

                        <input
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        className="btn-nova-carga"
                        type="submit"
                    >
                        Salvar Cliente
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default NovoCliente