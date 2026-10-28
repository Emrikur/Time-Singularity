
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LogoutBtn(){
const navigate = useNavigate()
const { logout } = useAuth();
function handleLogout() {
      logout();
      navigate("/login");
    }
  return (
    <>
    <button type="button" className="default-Btn user-page-logout press" onClick={handleLogout}>
      <LogOut aria-hidden="true" />
      Log out
    </button>
    </>
  )
}
