import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import AdminHeader from "../components/layout/AdminHeader";
import { alterarSenha, buscarUsuarioLogado } from "../services/authService";
import {
    buscarPerfilCliente,
    type PerfilCliente,
} from "../services/clienteService";

function MeuPerfil() {
    const usuario = buscarUsuarioLogado();
    const [perfilCliente, setPerfilCliente] = useState<PerfilCliente | null>(null);
    const [erroPerfil, setErroPerfil] = useState("");
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [carregandoPerfil, setCarregandoPerfil] = useState(true);

    const perfilNormalizado = usuario?.perfil.trim().toLowerCase();
    const cliente = perfilNormalizado === "cliente";

    useEffect(() => {
        let ativo = true;

        async function carregarPerfilCliente() {
            if (!cliente) {
                setCarregandoPerfil(false);
                return;
            }

            try {
                const perfil = await buscarPerfilCliente();

                if (ativo) {
                    setPerfilCliente(perfil);
                }
            } catch (error) {
                console.error("Erro ao carregar o perfil:", error);

                if (ativo) {
                    setErroPerfil(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar o perfil."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregandoPerfil(false);
                }
            }
        }

        carregarPerfilCliente();

        return () => {
            ativo = false;
        };
    }, [cliente]);

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
            <div className="admin-page meu-perfil-page">
                <AdminHeader
                    title="Meu Perfil"
                    subtitle="Consulte seus dados e altere sua senha."
                />

                <div className="meu-perfil-conteudo">
                    <section className="admin-card meu-perfil-card perfil-dados">
                        <div className="meu-perfil-card-cabecalho">
                            <span>Perfil</span>
                            <h2>Informações da conta</h2>
                            <p>Dados associados ao seu acesso no sistema.</p>
                        </div>

                        {carregandoPerfil ? (
                            <p>Carregando dados...</p>
                        ) : erroPerfil ? (
                            <p className="mensagem-erro">{erroPerfil}</p>
                        ) : (
                            <div className="perfil-dados-grid">
                                <div className="perfil-dado-item">
                                    <span>Nome</span>
                                    <strong>{perfilCliente?.nome || usuario?.nome || "-"}</strong>
                                </div>

                                <div className="perfil-dado-item">
                                    <span>Usuário</span>
                                    <strong>{usuario?.usuario || "-"}</strong>
                                </div>

                                <div className="perfil-dado-item">
                                    <span>Perfil</span>
                                    <strong>{usuario?.perfil || "-"}</strong>
                                </div>

                                {cliente && perfilCliente && (
                                    <>
                                        <div className="perfil-dado-item">
                                            <span>Empresa</span>
                                            <strong>{perfilCliente.empresa || "-"}</strong>
                                        </div>
                                        <div className="perfil-dado-item">
                                            <span>Nome fantasia</span>
                                            <strong>{perfilCliente.nome_fantasia || "-"}</strong>
                                        </div>
                                        <div className="perfil-dado-item">
                                            <span>Responsável</span>
                                            <strong>{perfilCliente.responsavel || "-"}</strong>
                                        </div>
                                        <div className="perfil-dado-item">
                                            <span>E-mail</span>
                                            <strong>{perfilCliente.email || "-"}</strong>
                                        </div>
                                        <div className="perfil-dado-item">
                                            <span>Telefone</span>
                                            <strong>{perfilCliente.telefone || "-"}</strong>
                                        </div>
                                        <div className="perfil-dado-item">
                                            <span>Documento</span>
                                            <strong>{perfilCliente.documento || "-"}</strong>
                                        </div>
                                        <div className="perfil-dado-item">
                                            <span>Endereço</span>
                                            <strong>{perfilCliente.endereco || "-"}</strong>
                                        </div>
                                        <div className="perfil-dado-item">
                                            <span>Cidade/UF</span>
                                            <strong>
                                                {perfilCliente.cidade || "-"}
                                                {perfilCliente.estado ? `/${perfilCliente.estado}` : ""}
                                            </strong>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </section>

                    <form
                        className="admin-card admin-form meu-perfil-card meu-perfil-senha-card"
                        onSubmit={handleAlterarSenha}
                    >
                        <div className="meu-perfil-card-cabecalho">
                            <span>Segurança</span>
                            <h2>Alterar senha</h2>
                            <p>Informe sua senha atual para definir uma nova senha.</p>
                        </div>

                        <div className="linha-input">
                            <label>Senha atual</label>
                            <input
                                type="password"
                                value={senhaAtual}
                                onChange={(event) => setSenhaAtual(event.target.value)}
                                required
                            />
                        </div>

                        <div className="linha-input">
                            <label>Nova senha</label>
                            <input
                                type="password"
                                value={novaSenha}
                                onChange={(event) => setNovaSenha(event.target.value)}
                                required
                            />
                        </div>

                        <div className="linha-input">
                            <label>Confirmar nova senha</label>
                            <input
                                type="password"
                                value={confirmarSenha}
                                onChange={(event) => setConfirmarSenha(event.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary">
                            Alterar Senha
                        </button>

                        {mensagem && <p className="meu-perfil-mensagem">{mensagem}</p>}
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default MeuPerfil;
