import { useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"
import { useNotification } from "../components/ui/NotificationProvider"

function NovoCliente() {
    const navigate = useNavigate()
    const { notificar } = useNotification()

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

            const dados = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                notificar(
                    resposta.status === 403 || resposta.status === 409 ? "aviso" : "erro",
                    dados?.erro || dados?.msg || "Erro ao cadastrar cliente."
                )
                return
            }

            notificar("sucesso", "Cliente cadastrado com sucesso!")
            navigate("/admin/clientes")
        } catch {
            notificar("erro", "Erro ao conectar com servidor.")
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
                    className="admin-form admin-form-card admin-form-grid"
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
