import { useState } from "react";
import { Search, Check } from "lucide-react";
import AdminTopBar from "./AdminTopBar";
import StatusBadge from "../../components/StatusBadge";
import { useOrders } from "../../components/OrdersContext";
import { matchesSearch } from "../../components/Search";
import { sortNewestFirst, summarizeItems } from "../../components/Orders";
import type { OrderStatus } from "../../types/order";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ACTION_LABEL: Record<OrderStatus, string | null> = {
  Aguardando: "Confirmar Pgto & Baixar Estoque",
  Confirmado: "Marcar como Enviado",
  Enviado: "Marcar como Entregue",
  Entregue: null,
};

// Página de vendas que exibe a gestão da listagem de vendas com busca e atualização do status de pagamento dos pedidos
export default function AdminSales() {
  const { orders, advanceOrder } = useOrders();
  const [search, setSearch] = useState("");

  const filteredOrders = sortNewestFirst(orders).filter((order) =>
    matchesSearch(search, order.id, order.customerName, order.customerEmail, summarizeItems(order.items), order.status)
  );

  return (
    <div>
      <AdminTopBar title="Vendas e Pedidos" />

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50">
          <h3 className="font-medium">Gestão de Pedidos</h3>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5 w-56">
            <Search size={14} className="text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar pedido.."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              <th className="px-6 py-3 font-normal">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const actionLabel = ACTION_LABEL[order.status];

              return (
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
                  <td className="px-6 py-4">
                    {actionLabel && (
                      <button
                        onClick={() => advanceOrder(order.id)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full whitespace-nowrap transition-colors ${
                          order.status === "Aguardando"
                            ? "bg-[#8b1538] hover:bg-[#71102d] text-white"
                            : "border border-[#8b1538] text-[#8b1538] hover:bg-[#faf1f0]"
                        }`}
                      >
                        <Check size={13} />
                        {actionLabel}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">Nenhum pedido encontrado.</p>
        )}
      </div>
    </div>
  );
}
