import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import AdminHeader from "../components/layout/AdminHeader";
import {
    alterarSenha,
    buscarUsuarioLogado,
} from "../services/authService";
import {
    buscarPerfilCliente,
    type PerfilCliente,
} from "../services/clienteService";

function MeuPerfil() {
    const usuario = buscarUsuarioLogado();
    const [perfilCliente, setPerfilCliente] = useState<PerfilCliente | null>(null);

    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [carregandoPerfil, setCarregandoPerfil] =
        useState(true);

    useEffect(() => {
        carregarPerfil();
    }, []);

    async function carregarPerfil() {
        try {
            const dados = await buscarPerfilCliente();
            setPerfilCliente(dados);
        } catch (error) {
            console.error(
                "Erro ao carregar perfil:",
                error
            );
        } finally {
            setCarregandoPerfil(false);
        }
    }

    useEffect(() => {
        async function carregarPerfil() {
            try {
                const perfil = await buscarPerfilCliente();
                setPerfilCliente(perfil);
            } catch (error) {
                console.error("Erro ao carregar o perfil:", error);
            }
        }

        carregarPerfil();
    }, []);

    async function handleAlterarSenha(event: React.FormEvent) {
        event.preventDefault();
        setMensagem("");

        if (!usuario) {
            setMensagem("Usuário não identificado.");
            return;
        }

        if (novaSenha.length < 6) {
            setMensagem("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setMensagem("A confirmação da senha não confere.");
            return;
        }

        try {
            await alterarSenha(usuario.id, {
                senha_atual: senhaAtual,
                nova_senha: novaSenha,
            });

            setMensagem("Senha alterada com sucesso!");
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
        } catch (error) {
            if (error instanceof Error) {
                setMensagem(error.message);
            } else {
                setMensagem("Erro ao alterar a senha.");
            }
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <AdminHeader
                    title="Meu Perfil"
                    subtitle="Consulte seus dados e altere sua senha."
                />

                <div className="admin-card">
                    <div className="perfil-dados">
                        <h2>Dados do Cliente</h2>

                        {carregandoPerfil ? (
                            <p>Carregando dados...</p>
                        ) : perfilCliente ? (
                            <div className="perfil-dados-grid">
                                <p>
                                    <strong>Empresa:</strong>{" "}
                                    {perfilCliente.empresa || "-"}
                                </p>

                                <p>
                                    <strong>Nome fantasia:</strong>{" "}
                                    {perfilCliente.nome_fantasia || "-"}
                                </p>

                                <p>
                                    <strong>Responsável:</strong>{" "}
                                    {perfilCliente.responsavel || "-"}
                                </p>

                                <p>
                                    <strong>E-mail:</strong>{" "}
                                    {perfilCliente.email || "-"}
                                </p>

                                <p>
                                    <strong>Telefone:</strong>{" "}
                                    {perfilCliente.telefone || "-"}
                                </p>

                                <p>
                                    <strong>Documento:</strong>{" "}
                                    {perfilCliente.documento || "-"}
                                </p>

                                <p>
                                    <strong>Endereço:</strong>{" "}
                                    {perfilCliente.endereco || "-"}
                                </p>

                                <p>
                                    <strong>Cidade/UF:</strong>{" "}
                                    {perfilCliente.cidade || "-"}
                                    {perfilCliente.estado
                                        ? `/${perfilCliente.estado}`
                                        : ""}
                                </p>
                            </div>
                        ) : (
                            <p>
                                Não foi possível carregar os dados do cliente.
                            </p>
                        )}
                    </div>

                    <form
                        className="admin-form"
                        onSubmit={handleAlterarSenha}
                    >
                        <h2>Alterar senha</h2>

                        <div className="linha-input">
                            <label>Senha atual</label>

                            <input
                                type="password"
                                value={senhaAtual}
                                onChange={(e) => setSenhaAtual(e.target.value)}
                                required
                            />
                        </div>

                        <div className="linha-input">
                            <label>Nova senha</label>

                            <input
                                type="password"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                required
                            />
                        </div>

                        <div className="linha-input">
                            <label>Confirmar nova senha</label>

                            <input
                                type="password"
                                value={confirmarSenha}
                                onChange={(e) =>
                                    setConfirmarSenha(e.target.value)
                                }
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary">
                            Alterar Senha
                        </button>

                        {mensagem && <p>{mensagem}</p>}
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default MeuPerfil;