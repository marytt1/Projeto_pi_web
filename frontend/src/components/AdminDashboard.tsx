import { useState } from "react";
import AdminSidebar, { type AdminPage } from "../components/AdminSidebar";
import AdminOverview from "../components/AdminOverview";
import AdminSales from "../components/AdminSales";
import AdminStock from "../components/AdminStock";


// Gerencia e alterna a renderização das telas do painel admin com base no estado da aba ativa
export default function AdminDashboard() {
  const [activePage, setActivePage] = useState<AdminPage>("dashboard");


  return (
    <div className="flex min-h-screen bg-[#fdf9f8]">
      <AdminSidebar active={activePage} onNavigate={setActivePage} />


      <main className="flex-1 px-10 py-8">
        {activePage === "dashboard" && <AdminOverview />}
        {activePage === "vendas" && <AdminSales />}
        {activePage === "estoque" && <AdminStock />}
      </main>
    </div>
  );
}
