import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"
import { buscarUsuarioLogado } from "../services/authService"
import { useNotification } from "../components/ui/NotificationProvider"

function EditarCliente() {
    const { id } = useParams()

    const navigate = useNavigate()
    const { notificar } = useNotification()
    const usuario = buscarUsuarioLogado()
    const administrador =
        usuario?.perfil?.trim().toLowerCase() === "administrador"

    const [razaoSocial, setRazaoSocial] = useState("")
    const [nomeFantasia, setNomeFantasia] = useState("")
    const [documento, setDocumento] = useState("")
    const [responsavel, setResponsavel] = useState("")
    const [email, setEmail] = useState("")
    const [telefone, setTelefone] = useState("")
    const [cidade, setCidade] = useState("")
    const [estado, setEstado] = useState("")
    const [ativo, setAtivo] = useState(true)

    async function carregarCliente() {
        const resposta = await apiFetch(
            `/api/admin/clientes/${id}`
        )

        const dados = await resposta.json()

        setRazaoSocial(dados.razao_social || "")
        setNomeFantasia(dados.nome_fantasia || "")
        setDocumento(dados.documento || "")
        setResponsavel(dados.responsavel || "")
        setEmail(dados.email || "")
        setTelefone(dados.telefone || "")
        setCidade(dados.cidade || "")
        setEstado(dados.estado || "")
        setAtivo(dados.ativo ?? true)
    }

    useEffect(() => {
        carregarCliente()
        
    }, [])

    async function salvarCliente() {
        await apiFetch(
            `/api/admin/clientes/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    razao_social: razaoSocial,
                    nome_fantasia: nomeFantasia,
                    documento,
                    responsavel,
                    email,
                    telefone,
                    cidade,
                    estado,
                    ...(administrador ? { ativo } : {}),
                }),
            }
        )

        notificar("sucesso", "Cliente atualizado com sucesso!")

        navigate("/admin/clientes")
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1>Editar Cliente</h1>

                <form
                    className="admin-form admin-form-card admin-form-grid"
                    onSubmit={(e) => {
                        e.preventDefault()
                        salvarCliente()
                    }}
                >
                    <div className="linha-input">
                        <label>Razão Social</label>

                        <input
                            value={razaoSocial}
                            onChange={(e) =>
                                setRazaoSocial(e.target.value)
                            }
                        />
                    </div>

                    <div className="linha-input">
                        <label>Nome Fantasia</label>

                        <input
                            value={nomeFantasia}
                            onChange={(e) =>
                                setNomeFantasia(e.target.value)
                            }
                        />
                    </div>

                    <div className="linha-input">
                        <label>Documento</label>

                        <input
                            value={documento}
                            onChange={(e) =>
                                setDocumento(e.target.value)
                            }
                        />
                    </div>

                    <div className="linha-input">
                        <label>Responsável</label>

                        <input
                            value={responsavel}
                            onChange={(e) =>
                                setResponsavel(e.target.value)
                            }
                        />
                    </div>

                    <div className="linha-input">
                        <label>E-mail</label>

                        <input
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />
                    </div>

                    <div className="linha-input">
                        <label>Telefone</label>

                        <input
                            value={telefone}
                            onChange={(e) =>
                                setTelefone(e.target.value)
                            }
                        />
                    </div>

                    <div className="linha-input">
                        <label>Cidade</label>

                        <input
                            value={cidade}
                            onChange={(e) =>
                                setCidade(e.target.value)
                            }
                        />
                    </div>

                    <div className="linha-input">
                        <label>Estado</label>

                        <input
                            value={estado}
                            onChange={(e) =>
                                setEstado(e.target.value)
                            }
                        />
                    </div>

                    {administrador && (
                        <div className="linha-input">
                            <label>Status</label>

                            <select
                                value={ativo ? "Ativo" : "Inativo"}
                                onChange={(e) => setAtivo(e.target.value === "Ativo")}
                            >
                                <option>Ativo</option>
                                <option>Inativo</option>
                            </select>
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

export default EditarCliente
