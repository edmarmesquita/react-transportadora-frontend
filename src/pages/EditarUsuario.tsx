import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import { apiFetch } from "../services/api";

function EditarUsuario() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [usuario, setUsuario] = useState("");
    const [email, setEmail] = useState("");
    const [perfil, setPerfil] = useState("");
    const [ativo, setAtivo] = useState(true);

    const [redefinirSenha, setRedefinirSenha] = useState(false);
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    useEffect(() => {
        carregarUsuario();
    }, [id]);

    async function carregarUsuario() {
        try {
            const resposta = await apiFetch(
                `/api/admin/usuarios/${id}`
            );

            if (!resposta.ok) {
                throw new Error("Erro ao carregar usuário.");
            }

            const dados = await resposta.json();

            setNome(dados.nome);
            setUsuario(dados.usuario);
            setEmail(dados.email || "");
            setPerfil(dados.perfil);
            setAtivo(dados.ativo);
        } catch (erro) {
            console.error("Erro ao carregar usuário:", erro);
            alert("Não foi possível carregar o usuário.");
        }
    }

    async function salvarAlteracoes(event: React.FormEvent) {
        event.preventDefault();

        if (redefinirSenha) {
            if (novaSenha.length < 6) {
                alert("A nova senha deve ter pelo menos 6 caracteres.");
                return;
            }

            if (novaSenha !== confirmarSenha) {
                alert("A confirmação da senha não confere.");
                return;
            }
        }

        const dadosAtualizados = {
            nome,
            usuario,
            email,
            perfil,
            ativo,
            redefinir_senha: redefinirSenha,
            nova_senha: redefinirSenha ? novaSenha : undefined,
        };

        try {
            const resposta = await apiFetch(
                `/api/admin/usuarios/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dadosAtualizados),
                }
            );

            const dados = await resposta.json().catch(() => null);

            if (!resposta.ok) {
                throw new Error(
                    dados?.erro || "Erro ao atualizar usuário."
                );
            }

            alert("Usuário atualizado com sucesso!");
            navigate("/admin/usuarios");
        } catch (erro) {
            console.error("Erro ao atualizar usuário:", erro);

            if (erro instanceof Error) {
                alert(erro.message);
            } else {
                alert("Erro ao atualizar usuário.");
            }
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1>Editar Usuário</h1>

                <form
                    className="admin-form"
                    onSubmit={salvarAlteracoes}
                >
                    <div className="linha-input">
                        <label>Nome</label>

                        <input
                            value={nome}
                            onChange={(event) =>
                                setNome(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label>Usuário</label>

                        <input
                            value={usuario}
                            onChange={(event) =>
                                setUsuario(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label>E-mail</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                        />
                    </div>

                    <div className="linha-input">
                        <label>Perfil</label>

                        <select
                            value={perfil}
                            onChange={(event) =>
                                setPerfil(event.target.value)
                            }
                        >
                            <option value="administrador">
                                Administrador
                            </option>

                            <option value="operador">
                                Operador
                            </option>

                            <option value="motorista">
                                Motorista
                            </option>

                            <option value="cliente">
                                Cliente
                            </option>
                        </select>
                    </div>

                    <div className="linha-input">
                        <label>Status</label>

                        <select
                            value={ativo ? "ativo" : "inativo"}
                            onChange={(event) =>
                                setAtivo(event.target.value === "ativo")
                            }
                        >
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>

                    <div className="linha-input">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={redefinirSenha}
                                onChange={(event) => {
                                    const marcado = event.target.checked;

                                    setRedefinirSenha(marcado);

                                    if (!marcado) {
                                        setNovaSenha("");
                                        setConfirmarSenha("");
                                    }
                                }}
                            />

                            Redefinir senha deste usuário
                        </label>
                    </div>

                    {redefinirSenha && (
                        <>
                            <div className="linha-input">
                                <label>Nova senha</label>

                                <input
                                    type="password"
                                    value={novaSenha}
                                    onChange={(event) =>
                                        setNovaSenha(event.target.value)
                                    }
                                    minLength={6}
                                    required
                                />
                            </div>

                            <div className="linha-input">
                                <label>Confirmar nova senha</label>

                                <input
                                    type="password"
                                    value={confirmarSenha}
                                    onChange={(event) =>
                                        setConfirmarSenha(event.target.value)
                                    }
                                    minLength={6}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                    >
                        Salvar Alterações
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}

export default EditarUsuario;