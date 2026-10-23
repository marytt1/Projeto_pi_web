import { useNavigate } from "react-router";
import AuthModal from "../components/AuthModal";

// Página dedicada à tela de Cadastro
export default function SignUpPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] bg-[#f3e7e5]">
      <AuthModal initialMode="cadastrar" onClose={() => navigate("/")} />
    </div>
  );
}

