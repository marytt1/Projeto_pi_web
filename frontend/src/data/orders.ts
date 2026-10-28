import { PRODUCTS } from "./products";
import { getColorName } from "./colors";
import { daysAgo, calculateTotal } from "../components/Orders";
import type { Order, OrderItem, OrderStatus } from "../types/order";

// Monta um item de pedido a partir de um produto real da loja
function item(productId: string, size: string, colorIndex: number, quantity = 1): OrderItem {
  const product = PRODUCTS.find((p) => p.id === productId)!;
  return {
    productId,
    name: product.name,
    image: product.image,
    size,
    colorName: getColorName(product.colors[colorIndex]),
    quantity,
    price: product.price,
  };
}

function order(
  id: string,
  customerName: string,
  customerEmail: string,
  items: OrderItem[],
  date: string,
  status: OrderStatus
): Order {
  return {
    id,
    customerName,
    customerEmail,
    items,
    total: calculateTotal(items),
    date,
    status,
    // pedidos já confirmados tem o estoque descontado
    stockDeducted: status !== "Aguardando",
  };
}

// Pedidos de exemplo (de outras clientes)
export const ORDERS: Order[] = [
  order("ORD-001", "Ana Paula Souza", "ana@email.com", [item("top-alice", "M", 0)], daysAgo(0), "Aguardando"),
  order("ORD-002", "Fernanda Lima", "fernanda@email.com", [item("cropped-grazy", "P", 0), item("macaquinho-paola", "M", 1)], daysAgo(1), "Confirmado"),
  order("ORD-003", "Camila Rodrigues", "camila@email.com", [item("macaquinho-paola", "G", 0)], daysAgo(2), "Enviado"),
  order("ORD-004", "Beatriz Costa", "beatriz@email.com", [item("cropped-manga-jessica", "38", 0)], daysAgo(3), "Entregue"),
  order("ORD-005", "Juliana Martins", "juliana@email.com", [item("cropped-grazy", "M", 2)], daysAgo(0), "Aguardando"),
];
