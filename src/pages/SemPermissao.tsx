import { Link } from "react-router-dom";
import { buscarUsuarioLogado } from "../services/authService";

function SemPermissao() {
    const usuario = buscarUsuarioLogado();
    const perfil = usuario?.perfil?.trim().toLowerCase();

    let rotaPainel = "/admin/login";

    if (perfil === "administrador" || perfil === "operador") {
        rotaPainel = "/admin";
    } else if (perfil === "cliente") {
        rotaPainel = "/portal/cliente";
    } else if (perfil === "motorista") {
        rotaPainel = "/portal/motorista";
    }

    return (
        <main className="sem-permissao-page">
            <section className="sem-permissao-card">
                <h1>Acesso não autorizado</h1>

                <p>
                    Seu perfil não possui permissão para acessar
                    esta página.
                </p>

                <Link to={rotaPainel}>
                    Voltar ao painel
                </Link>
            </section>
        </main>
    );
}

export default SemPermissao;
