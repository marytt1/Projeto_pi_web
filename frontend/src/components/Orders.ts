import type { Order, OrderItem } from "../types/order";

// Data no formato dd/mm/aaaa
export function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Data de "n dias atrás", no mesmo formato (usada nos pedidos de exemplo)
export function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
}

// Cálculo do total
export function calculateTotal(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Resumo curto dos itens para as tabelas
export function summarizeItems(items: OrderItem[]) {
  return items.map((item) => (item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name)).join(", ");
}

// Numeração do pedido
function orderNumber(order: Order) {
  return Number(order.id.replace("ORD-", "")) || 0;
}

// Próximo número livre
export function nextOrderId(orders: Order[]) {
  const highest = orders.reduce((max, order) => Math.max(max, orderNumber(order)), 0);
  return `ORD-${String(highest + 1).padStart(3, "0")}`;
}

// Pedidos do mais novo para o mais antigo
export function sortNewestFirst(orders: Order[]) {
  return [...orders].sort((a, b) => orderNumber(b) - orderNumber(a));
}
