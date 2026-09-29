import { TrendingUp, Package, AlertTriangle, Search } from "lucide-react";
import AdminTopBar from "../components/AdminTopBar";
import StatusBadge from "../components/StatusBadge";
import { ORDERS } from "../data/orders";


function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


// Componente que exibe o painel principal com métricas resumidas (vendas, pendências, alertas) e os últimos pedidos realizados
export default function AdminOverview() {
  // Cálculos derivados dos dados simulados
  const salesToday = ORDERS.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = ORDERS.filter((order) => order.status === "Aguardando").length;
  const stockAlerts = 4;


  const recentOrders = ORDERS.slice(0, 5);


  return (
    <div>
      <AdminTopBar title="Visão Geral" />


      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Vendas Hoje</span>
            <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </span>
          </div>
          <p className="text-2xl font-semibold">{formatPrice(salesToday)}</p>
          <p className="text-xs text-neutral-400 mt-1">{ORDERS.length} pedidos realizados</p>
        </div>


        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Pedidos Pendentes</span>
            <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package size={16} />
            </span>
          </div>
          <p className="text-2xl font-semibold">{pendingOrders}</p>
          <p className="text-xs text-neutral-400 mt-1">aguardando confirmação de pagamento</p>
        </div>


        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Alertas de Estoque</span>
            <span className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </span>
          </div>
          <p className="text-2xl font-semibold">{stockAlerts}</p>
          <p className="text-xs text-neutral-400 mt-1">variações com 3 ou menos unidades</p>
        </div>
      </div>


     
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50">
          <h3 className="font-medium">Últimos Pedidos</h3>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5 w-56">
            <Search size={14} className="text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar pedido.."
              className="text-sm outline-none w-full placeholder:text-neutral-400"
            />
          </div>
        </div>


        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400 text-xs border-b border-neutral-100">
              <th className="px-6 py-3 font-normal">Pedido</th>
              <th className="px-6 py-3 font-normal">Cliente</th>
              <th className="px-6 py-3 font-normal">Itens</th>
              <th className="px-6 py-3 font-normal">Total</th>
              <th className="px-6 py-3 font-normal">Data</th>
              <th className="px-6 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-neutral-50 last:border-0">
                <td className="px-6 py-4 text-neutral-400">{order.id}</td>
                <td className="px-6 py-4">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-xs text-neutral-400">{order.customerPhone}</p>
                </td>
                <td className="px-6 py-4">{order.items}</td>
                <td className="px-6 py-4 font-medium">{formatPrice(order.total)}</td>
                <td className="px-6 py-4 text-neutral-500">{order.date}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


