import { Routes, Route } from "react-router";

import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";

import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import CadastroPage from "./pages/SignUpPage";
import NotFoundPage from "./pages/NotFoundPage";
import AccountPage from "./pages/AccountPage";
import RequireAuth from "./components/RequireAuth";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminSales from "./pages/admin/AdminSales";
import AdminStock from "./pages/admin/AdminStock";

// App é o componente principal da aplicação responsável pela visualização das páginas
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />                       {/* "/" */}
        <Route path="catalogo" element={<CatalogPage />} />          {/* "/catalogo" */}
        <Route path="produto/:id" element={<ProductDetailPage />} /> {/* "/produto/cropped-grazy" (rota dinâmica) */}
        <Route path="carrinho" element={<CartPage />} />             {/* "/carrinho" */}
        <Route path="login" element={<LoginPage />} />               {/* "/login" */}
        <Route path="cadastro" element={<CadastroPage />} />         {/* "/cadastro" */}
        {/* "/conta": só para quem está logado (visitante vai para /login) */}
        <Route
          path="conta"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />                {/* qualquer endereço que não existe */}
      </Route>

      <Route
        path="admin"
        element={
          <RequireAuth adminOnly>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminOverview />} />                  {/* "/admin" */}
        <Route path="vendas" element={<AdminSales />} />             {/* "/admin/vendas" */}
        <Route path="estoque" element={<AdminStock />} />            {/* "/admin/estoque" */}
      </Route>
    </Routes>
  );
}