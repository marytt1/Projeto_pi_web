import { useEffect, useState } from "react";
import { Link } from "react-router";
import { TrendingUp, Package, AlertTriangle, Search, ChevronRight } from "lucide-react";
import AdminTopBar from "./AdminTopBar";
import StatusBadge from "../../components/StatusBadge";
import { useOrders } from "../../components/OrdersContext";
import { matchesSearch } from "../../components/Search";
import { sortNewestFirst, summarizeItems } from "../../components/Orders";
import Pagination from "../../components/Pagination";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const PAGE_SIZE = 5; // pedidos por página na lista

// Página que exibe o painel principal com métricas resumidas (vendas, pendências, alertas) e os últimos pedidos realizados
export default function AdminOverview() {
  const { orders, dashboard, loading, error, reload } = useOrders();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Ao abrir a tela, busca os dados mais recentes na API
  useEffect(() => {
    reload();
  }, [reload]);

  // Os números dos cards já vêm calculados pela API
  const salesToday = dashboard?.salesToday.total ?? 0;
  const salesCount = dashboard?.salesToday.orders ?? 0;
  const pendingOrders = dashboard?.pendingOrders ?? 0;
  const stockAlerts = dashboard?.stockAlerts.count ?? 0;
  const stockLimit = dashboard?.stockAlerts.limit ?? 3;

  const matchingOrders = sortNewestFirst(orders).filter((o) =>
    matchesSearch(search, o.id, o.customerName, o.customerEmail, summarizeItems(o.items), o.status)
  );

  // Paginação: 5 pedidos por vez, com setinhas para ver os outros
  const pageCount = Math.max(1, Math.ceil(matchingOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const recentOrders = matchingOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <AdminTopBar title="Visão Geral" />

      {error && (
        <div className="mb-5 flex items-center justify-between bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">
          <span>{error}</span>
          <button onClick={() => reload()} className="underline text-xs">
            Tentar novamente
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Vendas Hoje</span>
            <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </span>
          </div>
          <p className="text-2xl font-semibold">{formatPrice(salesToday)}</p>
          <p className="text-xs text-neutral-400 mt-1">
            {salesCount} pedido{salesCount !== 1 && "s"} com pagamento confirmado
          </p>
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
          <p className="text-xs text-neutral-400 mt-1">variações com {stockLimit} ou menos unidades</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50">
          <div className="flex items-center gap-4">
            <h3 className="font-medium">Últimos Pedidos</h3>
            <Link to="/admin/vendas" className="flex items-center gap-1 text-xs text-[#8b1538] hover:underline">
              Ver todas as vendas
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5 w-56">
            <Search size={14} className="text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar pedido.."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
                  <p className="text-xs text-neutral-400">{order.customerEmail}</p>
                </td>
                <td className="px-6 py-4 max-w-[220px]">{summarizeItems(order.items)}</td>
                <td className="px-6 py-4 font-medium">{formatPrice(order.total)}</td>
                <td className="px-6 py-4 text-neutral-500">{order.date}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={matchingOrders.length} onChange={setPage} />

        {recentOrders.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">
            {loading ? "Carregando..." : "Nenhum pedido encontrado."}
          </p>
        )}
      </div>
    </div>
  );
}
