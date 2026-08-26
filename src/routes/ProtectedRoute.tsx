import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import {
    buscarToken,
    buscarUsuarioLogado,
} from "../services/authService";

type ProtectedRouteProps = {
    children: ReactNode;
    perfisPermitidos?: string[];
};

function ProtectedRoute({
    children,
    perfisPermitidos = [],
}: ProtectedRouteProps) {
    const token = buscarToken();
    const usuario = buscarUsuarioLogado();

    if (!token || !usuario) {
        return <Navigate to="/admin/login" replace />;
    }

    const perfilUsuario = String(usuario.perfil)
        .trim()
        .toLowerCase();

    const perfisNormalizados = perfisPermitidos.map((perfil) =>
        perfil.trim().toLowerCase()
    );

    if (
        perfisNormalizados.length > 0 &&
        !perfisNormalizados.includes(perfilUsuario)
    ) {
        return <Navigate to="/sem-permissao" replace />;
    }

    return children;
}

export default ProtectedRoute;