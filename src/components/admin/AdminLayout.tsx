import { useRef, useState } from "react"
import type { ReactNode } from "react"
import AdminSidebar from "./AdminSidebar"
import AdminTopbar from "./AdminTopbar"
import { buscarUsuarioLogado } from "../../services/authService"

type AdminLayoutProps = {
    children: ReactNode
    className?: string
}

function AdminLayout({ children, className }: AdminLayoutProps) {
    const [menuAberto, setMenuAberto] = useState(false)
    const alternadorMenu = useRef<HTMLButtonElement>(null)
    const perfil = buscarUsuarioLogado()?.perfil?.trim().toLowerCase()
    const ehMotorista = perfil === "motorista"
    const ehCliente = perfil === "cliente"
    const nomeMenu = ehMotorista ? "menu do motorista" : ehCliente ? "menu do cliente" : "menu administrativo"

    return (
        <div className={`admin-layout${ehCliente ? " cliente-layout" : ""}${className ? ` ${className}` : ""}`}>
            <AdminSidebar
                aberto={menuAberto}
                fecharMenu={() => {
                    setMenuAberto(false)
                    if (menuAberto) alternadorMenu.current?.focus()
                }}
            />

            {menuAberto && (
                <button
                    type="button"
                    className="admin-sidebar-overlay"
                    aria-label={`Fechar ${nomeMenu}`}
                    onClick={() => {
                        setMenuAberto(false)
                        alternadorMenu.current?.focus()
                    }}
                />
            )}

            <main className="admin-content">
                <button
                    ref={alternadorMenu}
                    type="button"
                    className="admin-menu-toggle"
                    aria-label={`${menuAberto ? "Fechar" : "Abrir"} ${nomeMenu}`}
                    aria-expanded={menuAberto}
                    aria-controls="admin-sidebar-navigation"
                    onClick={() => setMenuAberto((aberto) => !aberto)}
                >
                    ☰
                </button>

                <AdminTopbar />

                {children}
            </main>
        </div>
    )
}

export default AdminLayout
