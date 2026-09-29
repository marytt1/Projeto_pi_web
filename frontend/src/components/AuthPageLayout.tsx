import { useState } from "react";
import Header from "../components/Header";
import AuthModal from "../components/AuthModal";


type AuthPageLayoutProps = {
  initialMode: "entrar" | "cadastrar";
};


// Componente com Layout padrão das páginas de autenticação que renderiza o cabeçalho e exibe o modal de login ou cadastro
export default function AuthPageLayout({ initialMode }: AuthPageLayoutProps) {
  const [modalOpen, setModalOpen] = useState(true);


  return (
    <div className="font-sans text-[#3a3a3a]">
      <Header />
     
      <div className="min-h-[70vh] bg-[#f3e7e5]">
        {modalOpen && (
          <AuthModal initialMode={initialMode} onClose={() => setModalOpen(false)} />
        )}
      </div>
    </div>
  );
}
