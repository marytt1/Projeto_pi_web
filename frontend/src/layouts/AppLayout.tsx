import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../components/AuthContext";

// Layout do site da loja: Header e Footer são fixos, enquanto o <Outlet /> onde entra a página da rota atual (Home, Catálogo, Detalhes, Carrinho...)
export default function AppLayout() {
  const { hash, key, pathname } = useLocation();
  const { authModal, closeAuthModal } = useAuth();

  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [hash, key]);

  const isAuthRoute = pathname === "/login" || pathname === "/cadastro";

  return (
    <div className="font-sans text-[#3a3a3a]">
      <Header />
      <Outlet />
      <Footer />

      {authModal && !isAuthRoute && (
        <AuthModal
          initialMode={authModal.mode}
          message={authModal.message}
          onClose={closeAuthModal}
        />
      )}
    </div>
  );
}