import { useNavigate } from "react-router-dom";
import {
    buscarUsuarioLogado,
    logout,
} from "../../services/authService";

function AdminTopbar() {
    const navigate = useNavigate();

    const usuario = buscarUsuarioLogado();

    function sair() {
        logout();
        navigate("/admin/login");
    }

    return (
        <header className="admin-topbar">

            <div>
                <h1>Transportadora Ramos</h1>

                <p>
                    Central administrativa de cargas, viagens e entregas
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