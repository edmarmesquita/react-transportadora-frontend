import { NavLink } from "react-router-dom";
import { adminMenu } from "../../data/adminMenu";
import { buscarUsuarioLogado } from "../../services/authService";

type AdminSidebarProps = {
    aberto: boolean;
    fecharMenu: () => void;
};

function AdminSidebar({ aberto, fecharMenu }: AdminSidebarProps) {
    const usuarioLogado = buscarUsuarioLogado();

    const perfil = usuarioLogado?.perfil?.toLowerCase() ?? "";

    const menuPermitido = adminMenu.filter((item) =>
        item.perfis.includes(perfil)
    );

    return (
        <aside
            id="admin-sidebar-navigation"
            className={`admin-sidebar${aberto ? " aberta" : ""}`}
        >
            <h2>ROTANZA</h2>

            <nav>
                {menuPermitido.map((item) => {
                    const Icone = item.icone;

                    return (
                        <NavLink
                            key={item.rota}
                            to={item.rota}
                            end={item.end}
                            onClick={fecharMenu}
                        >
                            <Icone size={20} />
                            <span>{item.titulo}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}

export default AdminSidebar;
