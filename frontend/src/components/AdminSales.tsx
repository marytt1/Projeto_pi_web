import { useState } from "react";
import { Search, Check, MessageCircle } from "lucide-react";
import AdminTopBar from "../components/AdminTopBar";
import StatusBadge from "../components/StatusBadge";
import { ORDERS } from "../data/orders";
import type { Order } from "../types/order";


function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


// Componente que exibe a gestão da listagem de vendas com busca e atualização do status de pagamento dos pedidos
export default function AdminSales() {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [search, setSearch] = useState("");


  function confirmPayment(id: string) {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status: "Confirmado" } : order))
    );
  }


  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase())
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
            {filteredOrders.map((order) => (
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
                <td className="px-6 py-4">
                  {order.status === "Aguardando" ? (
                    <button
                      onClick={() => confirmPayment(order.id)}
                      className="flex items-center gap-1.5 bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-xs font-medium px-3 py-2 rounded-full whitespace-nowrap"
                    >
                      <Check size={13} />
                      Confirmar Pgto &amp; Baixar Estoque
                    </button>
                  ) : (
                    <button className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors text-xs font-medium px-3 py-2 rounded-full">
                      <MessageCircle size={13} />
                      WhatsApp
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
