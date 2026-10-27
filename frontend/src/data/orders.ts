import type { Order } from "../types/order";

// Pedidos simulados exibidos no Dashboard Administrativo (Vendas)
export const ORDERS: Order[] = [
  {
    id: "ORD-001",
    customerName: "Ana Paula Souza",
    items: "Conj. Rendado",
    total: 189.9,
    date: "26/08/2026",
    status: "Aguardando",
  },
  {
    id: "ORD-002",
    customerName: "Fernanda Lima",
    items: "Top Fitness",
    total: 259.8,
    date: "25/08/2026",
    status: "Confirmado",
  },
  {
    id: "ORD-003",
    customerName: "Camila Rodrigues",
    items: "Body Cetim",
    total: 219.9,
    date: "24/08/2026",
    status: "Enviado",
  },
  {
    id: "ORD-004",
    customerName: "Beatriz Costa",
    items: "Legging Sculpt",
    total: 159.9,
    date: "23/08/2026",
    status: "Entregue",
  },
  {
    id: "ORD-005",
    customerName: "Juliana Martins",
    items: "Sutiã Wireless",
    total: 149.9,
    date: "26/08/2026",
    status: "Aguardando",
  },
];