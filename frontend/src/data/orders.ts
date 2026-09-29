import type { Order } from "../types/order";

// Pedidos simulados exibidos no Dashboard Administrativo (Vendas)
export const ORDERS: Order[] = [
  {
    id: "ORD-001",
    customerName: "Ana Paula Souza",
    customerPhone: "19999991111",
    items: "Top Alice",
    total: 189.9,
    date: "26/08/2026",
    status: "Aguardando",
  },
  {
    id: "ORD-002",
    customerName: "Fernanda Lima",
    customerPhone: "19999992222",
    items: "Top Jessica Manga Curta",
    total: 99.9,
    date: "25/08/2026",
    status: "Confirmado",
  },
  {
    id: "ORD-003",
    customerName: "Camila Rodrigues",
    customerPhone: "19999993333",
    items: "Macaquinho Paola",
    total: 219.9,
    date: "24/08/2026",
    status: "Enviado",
  },
  {
    id: "ORD-004",
    customerName: "Beatriz Costa",
    customerPhone: "19999994444",
    items: "Macaquinho Karol",
    total: 159.9,
    date: "23/08/2026",
    status: "Entregue",
  },
  {
    id: "ORD-005",
    customerName: "Juliana Martins",
    customerPhone: "19999995555",
    items: "Top Camila",
    total: 149.9,
    date: "26/08/2026",
    status: "Aguardando",
  },
];
