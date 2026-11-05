import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

export function useSair() {
    const navigate = useNavigate();

    return () => {
        logout();
        navigate("/admin/login");
    };
}
