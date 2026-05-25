import type { ReactNode } from "react"
import AdminSidebar from "./AdminSidebar"
import AdminTopbar from "./AdminTopbar"

type AdminLayoutProps = {
    children: ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-content">
                <AdminTopbar />

                {children}
            </main>
        </div>
    )
}

export default AdminLayout