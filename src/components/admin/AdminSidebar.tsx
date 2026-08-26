import { NavLink } from "react-router-dom";
import { adminMenu } from "../../data/adminMenu";
import { buscarUsuarioLogado } from "../../services/authService";

function AdminSidebar() {
    const usuarioLogado = buscarUsuarioLogado();

    const perfil = usuarioLogado?.perfil?.toLowerCase() ?? "";

    const menuPermitido = adminMenu.filter((item) =>
        item.perfis.includes(perfil)
    );

    return (
        <aside className="admin-sidebar">
            <h2>Ramos</h2>

            <nav>
                {menuPermitido.map((item) => {
                    const Icone = item.icone;

                    return (
                        <NavLink
                            key={item.rota}
                            to={item.rota}
                            end={item.end}
                        >
                            <Icone size={20} />
                            {item.titulo}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}

export default AdminSidebar;