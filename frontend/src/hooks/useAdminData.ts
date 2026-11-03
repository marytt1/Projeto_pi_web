import { useCallback, useEffect, useState } from "react";
import { admin as adminApi, ApiError } from "../services/api";
import {
  toDashboard,
  toOrder,
  toStockItem,
  type ApiDashboard,
  type ApiOrder,
  type ApiStockRow,
  type Dashboard,
} from "../services/adapters";
import type { Order, OrderStatus } from "../types/order";
import type { StockItem } from "../types/stock";
import type { ActionResult } from "./useShopData";

const errorMessage = (e: unknown) => (e instanceof ApiError ? e.message : "Algo deu errado. Tente novamente.");

export type OrderFilters = { search?: string; status?: OrderStatus };

export function useAdminData(enabled: boolean) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadDashboard = useCallback(async () => {
    const data = (await adminApi.dashboard()) as ApiDashboard;
    setDashboard(toDashboard(data));
  }, []);

  // Tela "Vendas e Pedidos" e a busca "Buscar pedido..."
  const loadOrders = useCallback(async (filters: OrderFilters = {}) => {
    const data = (await adminApi.orders(filters)) as { orders: ApiOrder[] };
    setOrders(data.orders.map(toOrder));
  }, []);

  // Tela "Estoque" e a busca "Buscar produto..."
  const loadStock = useCallback(async (search?: string) => {
    const data = (await adminApi.stock(search)) as { items: ApiStockRow[] };
    setStock(data.items.map(toStockItem));
  }, []);

  const reloadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadDashboard(), loadOrders(), loadStock()]);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [loadDashboard, loadOrders, loadStock]);

  useEffect(() => {
    if (enabled) reloadAll();
  }, [enabled, reloadAll]);
  const confirmPayment = useCallback(
    async (order: Order): Promise<ActionResult> => {
      if (order.apiId === undefined) return { ok: false, message: "Pedido sem identificador da API." };
      try {
        await adminApi.confirmPayment(order.apiId);
        await reloadAll();
        return { ok: true };
      } catch (e) {
        return { ok: false, message: errorMessage(e) };
      }
    },
    [reloadAll]
  );

  // Confirmado -> Enviado -> Entregue
  const advanceStatus = useCallback(
    async (order: Order, next: "Enviado" | "Entregue"): Promise<ActionResult> => {
      if (order.apiId === undefined) return { ok: false, message: "Pedido sem identificador da API." };
      try {
        await adminApi.setOrderStatus(order.apiId, next);
        await Promise.all([loadOrders(), loadDashboard()]);
        return { ok: true };
      } catch (e) {
        return { ok: false, message: errorMessage(e) };
      }
    },
    [loadOrders, loadDashboard]
  );

  // Botão "Salvar" da edição de estoque na linha
  const updateStock = useCallback(
    async (item: StockItem, value: number): Promise<ActionResult> => {
      if (item.variantId === undefined) return { ok: false, message: "Item sem identificador da API." };
      if (!Number.isInteger(value) || value < 0) {
        return { ok: false, message: "O estoque deve ser um número inteiro maior ou igual a zero." };
      }
      try {
        await adminApi.setStock(item.variantId, value);
        await Promise.all([loadStock(), loadDashboard()]);
        return { ok: true };
      } catch (e) {
        return { ok: false, message: errorMessage(e) };
      }
    },
    [loadStock, loadDashboard]
  );

  return {
    dashboard, orders, stock, loading, error,
    reloadAll, loadOrders, loadStock,
    confirmPayment, advanceStatus, updateStock,
  };
}
