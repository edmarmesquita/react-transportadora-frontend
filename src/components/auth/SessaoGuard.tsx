import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    EVENTO_SESSAO_NAO_AUTORIZADA,
} from "../../services/api";
import { logout } from "../../services/authService";
import { useNotification } from "../ui/NotificationProvider";

function SessaoGuard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { notificar } = useNotification();
    const tratandoSessao = useRef(false);

    useEffect(() => {
        if (location.pathname === "/admin/login") {
            tratandoSessao.current = false;
            return;
        }

        function tratarSessaoNaoAutorizada() {
            if (tratandoSessao.current) return;

            tratandoSessao.current = true;
            logout();
            notificar(
                "erro",
                "Seu usuário está inativo. Entre em contato com o administrador."
            );
            navigate("/admin/login", { replace: true });
        }

        window.addEventListener(
            EVENTO_SESSAO_NAO_AUTORIZADA,
            tratarSessaoNaoAutorizada
        );

        return () => {
            window.removeEventListener(
                EVENTO_SESSAO_NAO_AUTORIZADA,
                tratarSessaoNaoAutorizada
            );
        };
    }, [location.pathname, navigate, notificar]);

    return null;
}

export default SessaoGuard;
