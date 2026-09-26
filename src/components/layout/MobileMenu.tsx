import { NavLink } from "react-router-dom"
type MobileMenuProps = {
    fecharMenu: () => void
}

function MobileMenu({ fecharMenu }: MobileMenuProps) {
    return (
        <nav
            id="menu-publico-mobile"
            className="mobile-menu"
            aria-label="Navegação principal"
        >
            <NavLink to="/" onClick={fecharMenu}>
                Home
            </NavLink>

            <NavLink
                to="/sobre"
                onClick={fecharMenu}
            >
                Plataforma
            </NavLink>

            <NavLink to="/frota" onClick={fecharMenu}>
                Gestão de Frota
            </NavLink>

            <NavLink to="/servicos" onClick={fecharMenu}>
                Recursos
            </NavLink>

            <NavLink to="/areas-atendidas" onClick={fecharMenu}>
                Operação Conectada
            </NavLink>

            <NavLink to="/parceiros" onClick={fecharMenu}>
                Ecossistema
            </NavLink>

            <NavLink to="/contato" onClick={fecharMenu}>
                Contato
            </NavLink>

            <NavLink to="/cliente" onClick={fecharMenu}>
                Portal do Cliente
            </NavLink>

            <NavLink to="/motorista" onClick={fecharMenu}>
                Portal do Motorista
            </NavLink>

            <NavLink
                to="/orcamento"
                onClick={fecharMenu}
            >
                Demonstração
            </NavLink>
        </nav>
    )
}

export default MobileMenu
