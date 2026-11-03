import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { AuthProvider } from "./components/AuthContext";
import { ShopProvider } from "./components/ShopContext";
import { OrdersProvider } from "./components/OrdersContext.tsx";
import App from "./App.tsx";

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