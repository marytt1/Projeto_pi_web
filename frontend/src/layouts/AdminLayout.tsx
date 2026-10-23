import { Outlet } from "react-router";
import AdminSidebar from "../pages/admin/AdminSidebar";

// Layout do painel administrativo: menu lateral fixo (aside) e, ao lado, o <Outlet /> com a tela da rota atual (Visão Geral, Vendas ou Estoque)
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#fdf9f8]">
      <AdminSidebar />
      <main className="flex-1 px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
