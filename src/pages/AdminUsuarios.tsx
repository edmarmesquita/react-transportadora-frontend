import type { Usuario } from "../types/usuario";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import StatusBadge from "../components/ui/StatusBadge";
import PerfilBadge from "../components/ui/PerfilBadge";
import AdminHeader from "../components/layout/AdminHeader";
import DataTable from "../components/ui/DataTable";
import { useNotification } from "../components/ui/NotificationProvider";
import { apiFetch } from "../services/api";
import {
    listarUsuarios,
    inativarUsuarioService,
} from "../services/usuariosService";

function AdminUsuarios() {
    const { notificar } = useNotification();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        carregarUsuarios();
    }, []);

    async function carregarUsuarios() {
        try {
            const dados = await listarUsuarios();

            setUsuarios(dados);

        } catch (error) {

            console.error(error);

            notificar("erro", "Não foi possível carregar os usuários.");

        } finally {

            setCarregando(false);

        }
    }

    async function alterarStatusUsuario(usuario: Usuario) {
        const ativar = !usuario.ativo;
        const acao = ativar ? "ativar" : "inativar";
        const confirmar = confirm(`Deseja realmente ${acao} este usuário?`);

        if (!confirmar) return;

        try {
            if (ativar) {
                const detalhe = await apiFetch(`/api/admin/usuarios/${usuario.id}`);
                const dados = await detalhe.json().catch(() => null);

                if (!detalhe.ok) {
                    throw new Error(
                        dados?.erro || "Não foi possível carregar o usuário."
                    );
                }

                const resposta = await apiFetch(`/api/admin/usuarios/${usuario.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nome: dados.nome,
                        usuario: dados.usuario,
                        email: dados.email || "",
                        perfil: dados.perfil,
                        ativo: true,
                        ...(dados.cliente_id != null
                            ? { cliente_id: dados.cliente_id }
                            : {}),
                    }),
                });
                const retorno = await resposta.json().catch(() => null);

                if (!resposta.ok) {
                    throw new Error(
                        retorno?.erro || "Não foi possível ativar o usuário."
                    );
                }
            } else {
                await inativarUsuarioService(usuario.id);
            }

            notificar(
                "sucesso",
                ativar
                    ? "Usuário ativado com sucesso!"
                    : "Usuário inativado com sucesso!"
            );
            await carregarUsuarios();
        } catch (error) {
            console.error("Erro ao inativar usuário:", error);
            notificar(
                "erro",
                error instanceof Error
                    ? error.message
                    : `Não foi possível ${acao} o usuário.`
            );
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page admin-usuarios-page">
                <AdminHeader
                    title="Usuários do Sistema"
                    subtitle="Gerencie administradores, operadores, motoristas e clientes."
                >
                    <Link
                        to="/admin/usuarios/novo"
                        className="btn-primary"
                    >
                        Novo Usuário
                    </Link>
                </AdminHeader>

                {carregando ? (
                    <p>Carregando usuários...</p>
                ) : (
                        <DataTable<Usuario>
                            columns={["Nome", "Usuário", "E-mail", "Perfil", "Status", "Criado em", "Ações"]}
                            data={usuarios}
                            searchable
                            searchPlaceholder="Pesquisar usuários..."
                            searchFields={["nome", "usuario", "email", "perfil"]}
                            emptyMessage="Nenhum usuário cadastrado."
                            renderRow={(usuario) => (
                                <>
                                    <td>{usuario.nome}</td>
                                    <td>{usuario.usuario}</td>
                                    <td>{usuario.email || "-"}</td>

                                    <td>
                                        <PerfilBadge perfil={usuario.perfil} />
                                    </td>

                                    <td>
                                        <StatusBadge ativo={usuario.ativo} />
                                    </td>

                                    <td>{usuario.data_criacao}</td>

                                    <td>
                                        <div className="admin-actions admin-table-actions">
                                            <Link
                                                to={`/admin/usuarios/editar/${usuario.id}`}
                                                className="btn-small btn-edit"
                                            >
                                                Editar
                                            </Link>

                                            <button
                                                className={`btn-small ${usuario.ativo ? "btn-disable" : "btn-ativar"}`}
                                                onClick={() => alterarStatusUsuario(usuario)}
                                            >
                                                {usuario.ativo ? "Inativar" : "Ativar"}
                                            </button>
                                        </div>
                                    </td>
                                </>
                            )}
                        />
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminUsuarios;
