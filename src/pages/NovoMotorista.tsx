import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../components/admin/AdminLayout";
import { apiFetch } from "../services/api";
import { buscarUsuarioLogado } from "../services/authService";
import { useNotification } from "../components/ui/NotificationProvider";

function NovoMotorista() {
    const navigate = useNavigate();
    const { notificar } = useNotification();
    const usuario = buscarUsuarioLogado();
    const administrador =
        usuario?.perfil?.trim().toLowerCase() === "administrador";

    const [salvando, setSalvando] = useState(false);

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
    });

    function handleChange(
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLSelectElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setSalvando(true);

            const resposta = await apiFetch(
                "/api/admin/motoristas",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        ...(administrador ? {} : { status: undefined }),
                    }),
                }
            );

            const dados = await resposta.json().catch(() => null);

            if (!resposta.ok) {
                notificar(
                    resposta.status === 403 || resposta.status === 409 ? "aviso" : "erro",
                    dados?.erro ||
                    dados?.msg ||
                    "Erro ao cadastrar motorista."
                );
                return;
            }

            notificar("sucesso", "Motorista cadastrado com sucesso!");

            navigate("/admin/motoristas");
        } catch (erro) {
            if (erro instanceof Error) {
                notificar("erro", erro.message);
            } else {
                notificar("erro",
                    "Erro ao conectar com o servidor."
                );
            }
        } finally {
            setSalvando(false);
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

                <form
                    className="admin-form admin-form-card admin-form-grid"
                    onSubmit={handleSubmit}
                >
                    <div className="linha-input">
                        <label htmlFor="nome">Nome</label>

                        <input
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="cpf">CPF</label>

                        <input
                            id="cpf"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="cnh">CNH</label>

                        <input
                            id="cnh"
                            name="cnh"
                            value={formData.cnh}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="categoria_cnh">
                            Categoria CNH
                        </label>

                        <select
                            id="categoria_cnh"
                            name="categoria_cnh"
                            value={formData.categoria_cnh}
                            onChange={handleChange}
                        >
                            <option value="">
                                Selecione
                            </option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="E">E</option>
                            <option value="AB">AB</option>
                            <option value="AC">AC</option>
                            <option value="AD">AD</option>
                            <option value="AE">AE</option>
                        </select>
                    </div>

                    <div className="linha-input">
                        <label htmlFor="validade_cnh">
                            Validade CNH
                        </label>

                        <input
                            id="validade_cnh"
                            type="date"
                            name="validade_cnh"
                            value={formData.validade_cnh}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="telefone">
                            Telefone
                        </label>

                        <input
                            id="telefone"
                            type="tel"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="email">E-mail</label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="usuario">
                            Usuário de acesso
                        </label>

                        <input
                            id="usuario"
                            name="usuario"
                            value={formData.usuario}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="senha">
                            Senha de acesso
                        </label>

                        <input
                            id="senha"
                            type="password"
                            name="senha"
                            value={formData.senha}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </div>

                    {administrador && (
                        <div className="linha-input">
                            <label htmlFor="status">Status</label>

                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Ativo">
                                    Ativo
                                </option>

                                <option value="Inativo">
                                    Inativo
                                </option>
                            </select>
                        </div>
                    )}

                    <div className="linha-input">
                        <label htmlFor="observacoes">
                            Observações
                        </label>

                        <textarea
                            id="observacoes"
                            name="observacoes"
                            value={formData.observacoes}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    <button
                        className="btn-nova-carga"
                        type="submit"
                        disabled={salvando}
                    >
                        {salvando
                            ? "Salvando..."
                            : "Salvar Motorista"}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}

export default NovoMotorista;
