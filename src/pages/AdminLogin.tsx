import { useState } from "react"
import { useNavigate } from "react-router-dom"

function AdminLogin() {
    const navigate = useNavigate()
    const [usuario, setUsuario] = useState("")
    const [senha, setSenha] = useState("")
    const [erro, setErro] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleLogin(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setErro("")
        setLoading(true)

        try {
            const resposta = await fetch(
                "http://127.0.0.1:5000/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        usuario,
                        senha,
                    }),
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                setErro(
                    dados.erro || "Erro ao fazer login."
                )

                setLoading(false)

                return
            }

            console.log("LOGIN:", dados)

            navigate("/admin")

            setLoading(false)
        } catch {
            setErro("Erro ao conectar com o servidor.")

            setLoading(false)
        }
    }

    return (
        <div className="admin-login-page">
            <form
                className="admin-login-form"
                onSubmit={handleLogin}
            >
                <h1>Painel Administrativo</h1>

                <input
                    type="text"
                    placeholder="Usuário"
                    value={usuario}
                    onChange={(event) =>
                        setUsuario(event.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(event) =>
                        setSenha(event.target.value)
                    }
                />

                <button type="submit">
                    {loading ? "Entrando..." : "Entrar"}
                </button>

                {erro && (
                    <p className="mensagem-erro">
                        {erro}
                    </p>
                )}
            </form>
        </div>
    )
}

export default AdminLogin