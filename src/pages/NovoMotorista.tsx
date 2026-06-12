import { useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"

function NovoMotorista() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        nome: "",
        cpf: "",
        cnh: "",
        categoria_cnh: "",
        validade_cnh: "",
        telefone: "",
        email: "",
        usuario: "",
        senha: "",
        status: "Ativo",
        observacoes: "",
    })

    function handleChange(
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLSelectElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ) {
        const { name, value } = event.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        try {
            const resposta = await fetch(
                "http://127.0.0.1:5000/api/admin/motoristas",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            )

            if (!resposta.ok) {
                alert("Erro ao cadastrar motorista.")
                return
            }

            navigate("/admin/motoristas")
        } catch {
            alert("Erro ao conectar com o servidor.")
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Novo Motorista</h1>
                        <p>Cadastro de motorista parceiro</p>
                    </div>
                </div>

                <form className="admin-form" onSubmit={handleSubmit}>
                    <div className="linha-input">
                        <label>Nome</label>
                        <input
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label>CPF</label>
                        <input
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>CNH</label>
                        <input
                            name="cnh"
                            value={formData.cnh}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Categoria CNH</label>
                        <input
                            name="categoria_cnh"
                            value={formData.categoria_cnh}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Validade CNH</label>
                        <input
                            name="validade_cnh"
                            value={formData.validade_cnh}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Telefone</label>
                        <input
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>E-mail</label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Usuário de acesso</label>
                        <input
                            name="usuario"
                            value={formData.usuario}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Senha de acesso</label>
                        <input
                            name="senha"
                            value={formData.senha}
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
                            <option>Ativo</option>
                            <option>Inativo</option>
                        </select>
                    </div>

                    <button
                        className="btn-nova-carga"
                        type="submit"
                    >
                        Salvar Motorista
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default NovoMotorista