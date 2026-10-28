import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { AuthProvider } from "./components/AuthContext";
import { ShopProvider } from "./components/ShopContext";
import { OrdersProvider } from "./components/OrdersContext.tsx";
import App from "./App.tsx";

// Localiza o elemento 'root' no HTML e renderiza o componente App dentro do StrictMode com o BrowserRouter responsável pelo roteamento, o AuthProvider para saber se o usuário está logado e o ShopProvider com o carrinho e favoritos acessíveis em todas as páginas, além do OrdersProvider para o compartilhamento do pedido e estoque entre a loja e o admin
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <OrdersProvider>
            <App />
          </OrdersProvider>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);