import { useState } from "react"
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
                <span className="logo-brand" aria-label="ROTANZA">ROTANZA</span>
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
