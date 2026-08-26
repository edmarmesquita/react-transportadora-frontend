import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    login,
    salvarToken,
    salvarUsuarioLogado,
} from "../services/authService";

function AdminLogin() {
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setErro("");
        setLoading(true);

        try {
            const dados = await login({
                usuario,
                senha,
            });

            salvarToken(dados.access_token);
            salvarUsuarioLogado(dados.usuario);

            const perfil = dados.usuario.perfil.toLowerCase();

            if (perfil === "motorista") {
                navigate("/portal/motorista");
            } else if (perfil === "cliente") {
                navigate("/portal/cliente");
            } else {
                navigate("/admin");
            }
            console.log("LOGIN:", dados);


        } catch (error) {
            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Erro ao conectar com o servidor.");
            }
        } finally {
            setLoading(false);
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

                <button type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                </button>

                {erro && (
                    <p className="mensagem-erro">
                        {erro}
                    </p>
                )}
            </form>
        </div>
    );
}

export default AdminLogin;