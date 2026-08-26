import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"
import { buscarUsuarioLogado } from "../services/authService"

function EditarMotorista() {
    const { id } = useParams()
    const navigate = useNavigate()
    const usuario = buscarUsuarioLogado()
    const administrador =
        usuario?.perfil?.trim().toLowerCase() === "administrador"
    const [mensagemErro, setMensagemErro] = useState("")

    const [nome, setNome] = useState("")
    const [cpf, setCpf] = useState("")
    const [cnh, setCnh] = useState("")
    const [categoriaCnh, setCategoriaCnh] = useState("")
    const [telefone, setTelefone] = useState("")
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState("Ativo")

    async function carregarMotorista() {
        try {
            setMensagemErro("")

            const resposta = await apiFetch(
                `/api/admin/motoristas/${id}`
            )

            const dados = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                throw new Error(
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível carregar o motorista."
                )
            }

            setNome(dados.nome || "")
            setCpf(dados.cpf || "")
            setCnh(dados.cnh || "")
            setCategoriaCnh(dados.categoria_cnh || "")
            setTelefone(dados.telefone || "")
            setEmail(dados.email || "")
            setStatus(dados.status || "Ativo")
        } catch (erro) {
            setMensagemErro(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível carregar o motorista."
            )
        }
    }

    useEffect(() => {
        carregarMotorista()
    }, [])

    async function salvarMotorista() {
        try {
            setMensagemErro("")

            const resposta = await apiFetch(
                `/api/admin/motoristas/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome,
                        cpf,
                        cnh,
                        categoria_cnh: categoriaCnh,
                        telefone,
                        email,
                        ...(administrador ? { status } : {}),
                    }),
                }
            )

            const dados = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                const mensagemPadrao = resposta.status === 403
                    ? "Você não possui permissão para alterar o status do motorista."
                    : resposta.status === 409
                        ? "Não é possível inativar este motorista enquanto houver viagem ou carga ativa."
                        : "Não foi possível atualizar o motorista."

                throw new Error(
                    dados?.erro || dados?.msg || mensagemPadrao
                )
            }

            alert(dados?.mensagem || "Motorista atualizado com sucesso!")
            navigate("/admin/motoristas")
        } catch (erro) {
            setMensagemErro(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível atualizar o motorista."
            )
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1>Editar Motorista</h1>

                {mensagemErro && (
                    <p className="mensagem-erro">{mensagemErro}</p>
                )}

                <form
                    className="admin-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        salvarMotorista()
                    }}
                >
                    <div className="linha-input">
                        <label>Nome</label>
                        <input value={nome} onChange={(e) => setNome(e.target.value)} />
                    </div>

                    <div className="linha-input">
                        <label>CPF</label>
                        <input value={cpf} onChange={(e) => setCpf(e.target.value)} />
                    </div>

                    <div className="linha-input">
                        <label>CNH</label>
                        <input value={cnh} onChange={(e) => setCnh(e.target.value)} />
                    </div>

                    <div className="linha-input">
                        <label>Categoria CNH</label>
                        <input
                            value={categoriaCnh}
                            onChange={(e) => setCategoriaCnh(e.target.value)}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Telefone</label>
                        <input
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                        />
                    </div>

                    <div className="linha-input">
                        <label>E-mail</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    {administrador ? (
                        <div className="linha-input">
                            <label>Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option>Ativo</option>
                                <option>Inativo</option>
                            </select>
                        </div>
                    ) : (
                        <div className="linha-input">
                            <label>Status</label>
                            <input value={status} disabled />
                        </div>
                    )}

                    <button type="submit" className="btn-nova-carga">
                        Salvar Alterações
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default EditarMotorista
