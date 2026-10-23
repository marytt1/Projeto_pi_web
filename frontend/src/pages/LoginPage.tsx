import { useNavigate } from "react-router";
import AuthModal from "../components/AuthModal";

// Página dedicada à tela de Login
export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] bg-[#f3e7e5]">
      <AuthModal initialMode="entrar" onClose={() => navigate("/")} />
    </div>
  );
}
