import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { House, Route, UserRound } from "lucide-react";
import { adminMenu } from "../../data/adminMenu";
import { buscarUsuarioLogado } from "../../services/authService";
import { useSair } from "./useSair";

type AdminSidebarProps = {
    aberto: boolean;
    fecharMenu: () => void;
};

function AdminSidebar({ aberto, fecharMenu }: AdminSidebarProps) {
    const usuarioLogado = buscarUsuarioLogado();

    const perfil = usuarioLogado?.perfil?.toLowerCase() ?? "";
    const ehMotorista = perfil === "motorista";
    const ehCliente = perfil === "cliente";
    const sair = useSair();
    const primeiroLinkMotorista = useRef<HTMLAnchorElement>(null);
    const primeiroLinkCliente = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (ehMotorista && aberto) primeiroLinkMotorista.current?.focus();
    }, [ehMotorista, aberto]);

    useEffect(() => {
        if (ehCliente && aberto) primeiroLinkCliente.current?.focus();
    }, [ehCliente, aberto]);

    const menuPermitido = adminMenu.filter((item) =>
        item.perfis.includes(perfil)
    );

    return (
        <aside
            id="admin-sidebar-navigation"
            className={`admin-sidebar${ehMotorista ? " motorista-sidebar" : ""}${ehCliente ? " cliente-sidebar" : ""}${aberto ? " aberta" : ""}`}
        >
            <h2>ROTANZA</h2>

            {ehMotorista ? (
                <>
                    <nav aria-label="Menu do motorista" className="motorista-sidebar-nav">
                        <div className="motorista-sidebar-grupo">
                            <h3>Área principal</h3>
                            <Link ref={primeiroLinkMotorista} to="/portal/motorista" onClick={fecharMenu}>
                                <House size={20} aria-hidden="true" />
                                <span>Início</span>
                            </Link>
                            <NavLink to="/portal/motorista" onClick={fecharMenu}>
                                <Route size={20} aria-hidden="true" />
                                <span>Minhas Viagens</span>
                            </NavLink>
                        </div>
                        <div className="motorista-sidebar-grupo">
                            <h3>Conta</h3>
                            <NavLink to="/admin/meu-perfil" onClick={fecharMenu}>
                                <UserRound size={20} aria-hidden="true" />
                                <span>Meu Perfil</span>
                            </NavLink>
                        </div>
                    </nav>
                    <div className="motorista-sidebar-rodape">
                        <strong>{usuarioLogado?.nome?.trim() || usuarioLogado?.usuario?.trim() || "Usuário"}</strong>
                        <span>Motorista</span>
                        <button type="button" onClick={sair}>Sair</button>
                    </div>
                </>
            ) : <><nav aria-label={ehCliente ? "Menu do cliente" : undefined}>
                {menuPermitido.map((item) => {
                    const Icone = item.icone;

                    return (
                        <NavLink
                            ref={ehCliente && item.rota === "/portal/cliente" ? primeiroLinkCliente : undefined}
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
                {ehCliente && <div className="cliente-sidebar-rodape">
                    <strong>{usuarioLogado?.nome?.trim() || usuarioLogado?.usuario?.trim() || "Usuário"}</strong>
                    <span>Cliente</span>
                    <button type="button" onClick={sair}>Sair</button>
                </div>}
            </>}
        </aside>
    );
}

export default AdminSidebar;
