import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Order, OrderItem, OrderStatus } from "../types/order";
import type { CartItem } from "../types/cart";
import type { StockItem } from "../types/stock";
import { ORDERS } from "../data/orders";
import { STOCK } from "../data/stock";
import { calculateTotal, formatDate, nextOrderId } from "../components/Orders";
import { normalizeText } from "../components/Search";

// Estado global de pedidos e estoque
const ORDERS_KEY = "larose_orders_v1";
const STOCK_KEY = "larose_stock_v1";

// Próximo status de cada pedido (Entregue é o fim do fluxo)
const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  Aguardando: "Confirmado",
  Confirmado: "Enviado",
  Enviado: "Entregue",
  Entregue: null,
};

type OrdersContextType = {
  orders: Order[];
  stock: StockItem[];
  placeOrder: (items: CartItem[], customerName: string, customerEmail: string) => Order;
  advanceOrder: (orderId: string) => void;
  addStockItem: (item: StockItem) => void;
  setStockQuantity: (sku: string, quantity: number) => void;
  removeStockItem: (sku: string) => void;
};

const OrdersContext = createContext<OrdersContextType | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sem espaço ou bloqueado: o site continua funcionando, só não salva
  }
}

// Desconta do estoque as peças de um pedido
function deductStock(stock: StockItem[], items: OrderItem[]): StockItem[] {
  return stock.map((row) => {
    const bought = items.find(
      (item) =>
        (row.productId === item.productId || normalizeText(row.product) === normalizeText(item.name)) &&
        normalizeText(row.variation) === normalizeText(`${item.colorName} / ${item.size}`)
    );
    return bought ? { ...row, stock: Math.max(0, row.stock - bought.quantity) } : row;
  });
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => load(ORDERS_KEY, ORDERS));
  const [stock, setStock] = useState<StockItem[]>(() => load(STOCK_KEY, STOCK));

  // Mantém duas abas do navegador sincronizadas
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (!event.newValue) return;
      if (event.key === ORDERS_KEY) setOrders(JSON.parse(event.newValue) as Order[]);
      if (event.key === STOCK_KEY) setStock(JSON.parse(event.newValue) as StockItem[]);
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function updateOrders(next: Order[]) {
    setOrders(next);
    save(ORDERS_KEY, next);
  }

  function updateStock(next: StockItem[]) {
    setStock(next);
    save(STOCK_KEY, next);
  }

  // Cria um pedido "Aguardando" a partir dos itens do carrinho
  function placeOrder(items: CartItem[], customerName: string, customerEmail: string): Order {
    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      size: item.size,
      colorName: item.colorName,
      quantity: item.quantity,
      price: item.price,
    }));

    const order: Order = {
      id: nextOrderId(orders),
      customerName,
      customerEmail,
      items: orderItems,
      total: calculateTotal(orderItems),
      date: formatDate(new Date()),
      status: "Aguardando",
      stockDeducted: false,
    };

    updateOrders([order, ...orders]);
    return order;
  }

  // Avança o pedido para a próxima etapa, baixando o estoque, uma única vez
  function advanceOrder(orderId: string) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    const shouldDeduct = order.status === "Aguardando" && !order.stockDeducted;
    if (shouldDeduct) updateStock(deductStock(stock, order.items));

    updateOrders(
      orders.map((o) =>
        o.id === orderId ? { ...o, status: nextStatus, stockDeducted: o.stockDeducted || shouldDeduct } : o
      )
    );
  }

  function addStockItem(item: StockItem) {
    updateStock([item, ...stock]);
  }

  function setStockQuantity(sku: string, quantity: number) {
    updateStock(stock.map((row) => (row.sku === sku ? { ...row, stock: quantity } : row)));
  }

  function removeStockItem(sku: string) {
    updateStock(stock.filter((row) => row.sku !== sku));
  }

  return (
    <OrdersContext.Provider
      value={{ orders, stock, placeOrder, advanceOrder, addStockItem, setStockQuantity, removeStockItem }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders precisa ser usado dentro de <OrdersProvider>");
  }
  return context;
}
