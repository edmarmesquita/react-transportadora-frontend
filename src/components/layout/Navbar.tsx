import { NavLink } from "react-router-dom"

function Navbar() {
    return (
        <nav className="navbar">
            <NavLink to="/">Home</NavLink>

            <NavLink to="/frota">
                Nossa Frota
            </NavLink>

            <NavLink to="/servicos">
                Serviços
            </NavLink>

            <NavLink to="/areas-atendidas">
                Áreas Atendidas
            </NavLink>

            <NavLink to="/parceiros">
                Parceiros
            </NavLink>

            <NavLink to="/contato">
                Contato
            </NavLink>

            <NavLink to="/cliente">
                Área do Cliente
            </NavLink>

            <NavLink to="/motorista">
                Área do Motorista
            </NavLink>

            <NavLink to="/orcamento">
                Orçamentos
            </NavLink>
        </nav>
    )
}

export default Navbar