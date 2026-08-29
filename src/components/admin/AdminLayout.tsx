import { useState } from "react"
import type { ReactNode } from "react"
import AdminSidebar from "./AdminSidebar"
import AdminTopbar from "./AdminTopbar"

type AdminLayoutProps = {
    children: ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
    const [menuAberto, setMenuAberto] = useState(false)

    return (
        <div className="admin-layout">
            <AdminSidebar
                aberto={menuAberto}
                fecharMenu={() => setMenuAberto(false)}
            />

            {menuAberto && (
                <button
                    type="button"
                    className="admin-sidebar-overlay"
                    aria-label="Fechar menu administrativo"
                    onClick={() => setMenuAberto(false)}
                />
            )}

            <main className="admin-content">
                <button
                    type="button"
                    className="admin-menu-toggle"
                    aria-label={
                        menuAberto
                            ? "Fechar menu administrativo"
                            : "Abrir menu administrativo"
                    }
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
