import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { AuthProvider } from "./components/AuthContext";
import { ShopProvider } from "./components/ShopContext";
import App from "./App.tsx";

// Localiza o elemento 'root' no HTML e renderiza o componente App dentro do StrictMode com o BrowserRouter responsável pelo roteamento, o AuthProvider para saber se o usuário está logado e o ShopProvider com o carrinho e favoritos acessíveis em todas as páginas
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);