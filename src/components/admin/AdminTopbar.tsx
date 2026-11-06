import { buscarUsuarioLogado } from "../../services/authService";
import { useSair } from "./useSair";

function AdminTopbar() {
    const usuario = buscarUsuarioLogado();
    const sair = useSair();
    const perfil = usuario?.perfil?.trim().toLowerCase();

    return (
        <header className="admin-topbar">

            <div>
                <h1>{perfil === "cliente" ? "Portal do Cliente" : "ROTANZA"}</h1>

                <p>
                    {perfil === "motorista"
                        ? "Central operacional do motorista"
                        : perfil === "cliente"
                            ? "Acompanhe suas cargas e entregas"
                        : "Central administrativa de cargas, viagens e entregas"}
                </p>
            </div>

            <div className="admin-user">

                <div>

                    <strong>{usuario?.nome}</strong>

                    <p>{perfil === "cliente" ? "Cliente" : usuario?.perfil}</p>

                </div>

                <button
                    className="btn-logout"
                    onClick={sair}
                >
                    Sair
                </button>

            </div>

        </header>
    );
}

export default AdminTopbar;
