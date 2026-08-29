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
                Sobre Nós
            </NavLink>

            <NavLink to="/frota" onClick={fecharMenu}>
                Nossa Frota
            </NavLink>

            <NavLink to="/servicos" onClick={fecharMenu}>
                Serviços
            </NavLink>

            <NavLink to="/areas-atendidas" onClick={fecharMenu}>
                Áreas Atendidas
            </NavLink>

            <NavLink to="/parceiros" onClick={fecharMenu}>
                Parceiros
            </NavLink>

            <NavLink to="/contato" onClick={fecharMenu}>
                Contato
            </NavLink>

            <NavLink to="/cliente" onClick={fecharMenu}>
                Área do Cliente
            </NavLink>

            <NavLink to="/motorista" onClick={fecharMenu}>
                Área do Motorista
            </NavLink>

            <NavLink
                to="/orcamento"
                onClick={fecharMenu}
            >
                Orçamentos
            </NavLink>
        </nav>
    )
}

export default MobileMenu
