import type { Usuario } from "../types/usuario";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import StatusBadge from "../components/ui/StatusBadge";
import PerfilBadge from "../components/ui/PerfilBadge";
import AdminHeader from "../components/layout/AdminHeader";
import DataTable from "../components/ui/DataTable";
import {
    listarUsuarios,
    inativarUsuarioService,
} from "../services/usuariosService";

function AdminUsuarios() {
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

            alert("Não foi possível carregar os usuários.");

        } finally {

            setCarregando(false);

        }
    }

    async function inativarUsuario(id: number) {
        const confirmar = confirm("Deseja realmente inativar este usuário?");

        if (!confirmar) return;

        try {
            await inativarUsuarioService(id);

            alert("Usuário inativado com sucesso!");
            carregarUsuarios();
        } catch (error) {
            console.error("Erro ao inativar usuário:", error);
            alert("Não foi possível inativar o usuário.");
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
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
                                        <div className="admin-actions">
                                            <Link
                                                to={`/admin/usuarios/editar/${usuario.id}`}
                                                className="btn-small btn-edit"
                                            >
                                                Editar
                                            </Link>

                                            <button
                                                className="btn-small btn-disable"
                                                onClick={() => inativarUsuario(usuario.id)}
                                            >
                                                Inativar
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