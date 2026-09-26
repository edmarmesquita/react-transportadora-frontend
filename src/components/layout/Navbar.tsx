import { NavLink } from "react-router-dom"

function Navbar() {
    return (
        <nav className="navbar">
            <NavLink to="/">Home</NavLink>

            <NavLink to="/sobre">
                Plataforma
            </NavLink>

            <NavLink to="/frota">
                Gestão de Frota
            </NavLink>

            <NavLink to="/servicos">
                Recursos
            </NavLink>

            <NavLink to="/areas-atendidas">
                Operação Conectada
            </NavLink>

            <NavLink to="/parceiros">
                Ecossistema
            </NavLink>

            <NavLink to="/contato">
                Contato
            </NavLink>

            <NavLink to="/cliente">
                Portal do Cliente
            </NavLink>

            <NavLink to="/motorista">
                Portal do Motorista
            </NavLink>

            <NavLink to="/orcamento">
                Demonstração
            </NavLink>
        </nav>
    )
}

export default Navbar
