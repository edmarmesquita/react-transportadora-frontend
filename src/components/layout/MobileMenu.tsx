import { NavLink } from "react-router-dom"
type MobileMenuProps = {
    fecharMenu: () => void
}

function MobileMenu({ fecharMenu }: MobileMenuProps) {
    return (
        <nav className="mobile-menu">
            <a href="#" onClick={fecharMenu}>
                Home
            </a>

            <a href="#" onClick={fecharMenu}>
                Nossa Frota
            </a>

            <a href="#" onClick={fecharMenu}>
                Serviços
            </a>

            <a href="#" onClick={fecharMenu}>
                Áreas Atendidas
            </a>

            <a href="#" onClick={fecharMenu}>
                Parceiros
            </a>

            <a href="#" onClick={fecharMenu}>
                Contato
            </a>

            <a href="#" onClick={fecharMenu}>
                Área do Cliente
            </a>

            <a href="#" onClick={fecharMenu}>
                Área do Motorista
            </a>

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