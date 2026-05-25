import {
    LayoutDashboard,
    Truck,
    Users,
    UserCog,
    FileBarChart,
    Package,
} from "lucide-react"

import { Link } from "react-router-dom"

function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            <h2>Ramos</h2>

            <nav>
                <Link to="/admin">
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                <Link to="/admin/cargas">
                    <Truck size={20} />
                    Cargas
                </Link>

                <Link to="/admin/clientes">
                    <Users size={20} />
                    Clientes
                </Link>

                <Link to="/admin/motoristas">
                    <UserCog size={20} />
                    Motoristas
                </Link>

                <Link to="/admin/veiculos">
                    <Package size={20} />
                    Veículos
                </Link>

                <Link to="/admin/relatorios">
                    <FileBarChart size={20} />
                    Relatórios
                </Link>
            </nav>
        </aside>
    )
}

export default AdminSidebar