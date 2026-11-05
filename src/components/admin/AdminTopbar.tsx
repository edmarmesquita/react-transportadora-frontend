import { buscarUsuarioLogado } from "../../services/authService";
import { useSair } from "./useSair";

function AdminTopbar() {
    const usuario = buscarUsuarioLogado();
    const sair = useSair();

    return (
        <header className="admin-topbar">

            <div>
                <h1>ROTANZA</h1>

                <p>
                    {usuario?.perfil?.trim().toLowerCase() === "motorista"
                        ? "Central operacional do motorista"
                        : "Central administrativa de cargas, viagens e entregas"}
                </p>
            </div>

            <div className="admin-user">

                <div>

                    <strong>{usuario?.nome}</strong>

                    <p>{usuario?.perfil}</p>

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
