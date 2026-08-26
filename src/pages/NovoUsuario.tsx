import { useState } from "react"
import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"

function NovoUsuario() {

    const [nome, setNome] = useState("")
    const [usuario, setUsuario] = useState("")
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("")
    const [perfil, setPerfil] = useState("operador")

    async function salvarUsuario(event: React.FormEvent) {
        event.preventDefault();

        try {
            const resposta = await apiFetch(
                "/api/admin/usuarios",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome: nome.trim(),
                        usuario: usuario.trim(),
                        email: email.trim(),
                        senha: senha.trim(),
                        perfil,
                    }),
                }
            );

            const dados = await resposta.json().catch(() => null);

            if (!resposta.ok) {
                throw new Error(
                    dados?.erro ||
                    dados?.mensagem ||
                    `Erro HTTP ${resposta.status}`
                );
            }

            alert(
                dados?.mensagem ||
                "Usuário cadastrado com sucesso!"
            );
        } catch (erro) {
            console.error(
                "Erro ao cadastrar usuário:",
                erro
            );

            if (erro instanceof Error) {
                alert(erro.message);
            } else {
                alert(
                    "Não foi possível salvar o usuário."
                );
            }
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1>Novo Usuário</h1>

                <form
                    className="admin-form"
                    onSubmit={salvarUsuario}
                >
                    <div className="linha-input">
                        <label>Nome</label>
                        <input value={nome} onChange={(e) => setNome(e.target.value)} />
                    </div>

                    <div className="linha-input">
                        <label>Usuário</label>
                        <input value={usuario} onChange={(e) => setUsuario(e.target.value)} />
                    </div>

                    <div className="linha-input">
                        <label>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Senha</label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>

                    <div className="linha-input">
                        <label>Perfil</label>
                        <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
                            <option value="administrador">Administrador</option>
                            <option value="operador">Operador</option>
                            <option value="motorista">Motorista</option>
                            <option value="cliente">Cliente</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary">
                        Salvar Usuário
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default NovoUsuario