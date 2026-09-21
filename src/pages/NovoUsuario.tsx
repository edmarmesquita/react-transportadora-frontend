import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"
import { useNotification } from "../components/ui/NotificationProvider"

type ClienteOpcao = {
    id: number;
    razao_social: string;
    nome_fantasia?: string;
    ativo: boolean;
};

function NovoUsuario() {
    const navigate = useNavigate()
    const { notificar } = useNotification()

    const [nome, setNome] = useState("")
    const [usuario, setUsuario] = useState("")
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("")
    const [perfil, setPerfil] = useState("operador")
    const [clientes, setClientes] = useState<ClienteOpcao[]>([])
    const [clienteId, setClienteId] = useState("")

    useEffect(() => {
        async function carregarClientes() {
            try {
                const resposta = await apiFetch("/api/admin/clientes");
                const dados = await resposta.json().catch(() => null);

                if (!resposta.ok) {
                    throw new Error(
                        dados?.erro || "Erro ao carregar clientes."
                    );
                }

                setClientes(
                    (Array.isArray(dados) ? dados : []).filter(
                        (cliente: ClienteOpcao) => cliente.ativo
                    )
                );
            } catch (erro) {
                notificar("erro", erro instanceof Error ? erro.message : "Erro ao carregar clientes.");
            }
        }

        carregarClientes();
    }, [notificar]);

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
                        cliente_id:
                            perfil === "cliente"
                                ? Number(clienteId)
                                : undefined,
                    }),
                }
            );

            const dados = await resposta.json().catch(() => null);

            if (!resposta.ok) {
                notificar(
                    resposta.status === 403 || resposta.status === 409 ? "aviso" : "erro",
                    dados?.erro ||
                    dados?.mensagem ||
                    `Erro HTTP ${resposta.status}`
                );
                return;
            }

            notificar("sucesso", "Usuário criado com sucesso!");
            navigate("/admin/usuarios");
        } catch (erro) {
            console.error(
                "Erro ao cadastrar usuário:",
                erro
            );

            if (erro instanceof Error) {
                notificar("erro", erro.message);
            } else {
                notificar("erro",
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
                    className="admin-form admin-form-card admin-form-grid"
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
                            required={perfil === "cliente"}
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

                    {perfil === "cliente" && (
                        <div className="linha-input">
                            <label>Cliente comercial</label>
                            <select
                                value={clienteId}
                                onChange={(e) => setClienteId(e.target.value)}
                                required
                            >
                                <option value="">Selecione um cliente</option>
                                {clientes.map((cliente) => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.razao_social}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button type="submit" className="btn-primary">
                        Salvar Usuário
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default NovoUsuario
