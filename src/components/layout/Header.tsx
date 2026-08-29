import { useState } from "react"
import logo from "../../assets/logo_ramos.png"
import Navbar from "./Navbar"
import MobileMenu from "./MobileMenu"

function Header() {
    const [menuAberto, setMenuAberto] = useState(false)

    function toggleMenu() {
        setMenuAberto((aberto) => !aberto)
    }

    return (
        <header className="header">
            <div className="logo">
                <img src={logo} alt="Logo Transportadora Ramos" />
            </div>

            <button
                type="button"
                className="menu-toggle"
                onClick={toggleMenu}
                aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
                aria-expanded={menuAberto}
                aria-controls="menu-publico-mobile"
            >
                ☰
            </button>

            <Navbar />

            {menuAberto && (
                <MobileMenu fecharMenu={() => setMenuAberto(false)} />
            )}
        </header>
    )
}

export default Header
