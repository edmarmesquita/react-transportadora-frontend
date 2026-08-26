import type { LucideIcon } from "lucide-react";
import { House, LayoutDashboard, UserRound } from "lucide-react";

import {
    Package,
    Users,
    UserCog,
    FileBarChart,
    Truck,
    ClipboardList,
    Route,
    ShieldUser,
} from "lucide-react";

export type MenuItem = {
    titulo: string;
    rota: string;
    icone: LucideIcon;
    perfis: string[];
    end?: boolean;
};

export const adminMenu: MenuItem[] = [
    
    {
        titulo: "Dashboard",
        rota: "/admin",
        icone: LayoutDashboard,
        perfis: ["administrador", "operador",],
        end: true,
    },
    {
        titulo: "Cargas",
        rota: "/admin/cargas",
        icone: Package,
        perfis: ["administrador", "operador"],
    },
    {
        titulo: "Clientes",
        rota: "/admin/clientes",
        icone: Users,
        perfis: ["administrador", "operador"],
    },
    {
        titulo: "Motoristas",
        rota: "/admin/motoristas",
        icone: UserCog,
        perfis: ["administrador", "operador"],
    },
    {
        titulo: "Veículos",
        rota: "/admin/veiculos",
        icone: Truck,
        perfis: ["administrador", "operador"],
    },
    {
        titulo: "Relatórios",
        rota: "/admin/relatorios",
        icone: FileBarChart,
        perfis: ["administrador"],
    },
    {
        titulo: "Cotações",
        rota: "/admin/cotacoes",
        icone: ClipboardList,
        perfis: ["administrador", "operador"],
    },
    {
        titulo: "Viagens",
        rota: "/admin/viagens",
        icone: Route,
        perfis: ["administrador", "operador",],
    },
    {
        titulo: "Usuários",
        rota: "/admin/usuarios",
        icone: ShieldUser,
        perfis: ["administrador"],
    },
    {
        titulo: "Meu Perfil",
        rota: "/admin/meu-perfil",
        icone: UserRound,
        perfis: ["administrador", "operador", "motorista"],
    },

    {
        titulo: "Início",
        rota: "/portal/cliente",
        icone: House,
        perfis: ["cliente"],
        end: true,
    },

    {
        titulo: "Meu Perfil",
        rota: "/portal/cliente/perfil",
        icone: UserRound,
        perfis: ["cliente"],
    },

    {
        titulo: "Minhas Viagens",
        rota: "/portal/motorista",
        icone: Route,
        perfis: ["motorista"],
    },

   
];