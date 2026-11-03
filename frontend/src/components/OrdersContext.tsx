import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { Order } from "../types/order";
import type { StockItem } from "../types/stock";
import { admin as adminApi, ApiError } from "../services/api";
import type { Dashboard } from "../services/adapters";
import { useAdminData } from "../hooks/useAdminData";
import type { ActionResult } from "../hooks/useShopData";
import { normalizeText } from "../components/Search";
import { useAuth } from "./AuthContext";
import { useShop } from "./ShopContext";

// Dados que o admin pode trocar em um produto
export type ProductEditData = {
  name: string;
  description: string;
  price: number;
  category: string;
};

// Estado global de pedidos e estoque
// Pedidos e estoque só são carregados para administradores; para os demais as listas ficam vazias.
// As ações são assíncronas e devolvem { ok, message }: mostre a message quando ok for false.
type OrdersContextType = {
  orders: Order[];
  stock: StockItem[];
  dashboard: Dashboard | null; // números prontos do painel (vendas de hoje, pendentes, alertas de estoque)
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;

  // Cria o pedido com o carrinho atual. Em caso de sucesso: result.whatsappUrl e result.orderCode
  placeOrder: () => Promise<ActionResult>;
  // Aguardando -> Confirmado (baixa o estoque) -> Enviado -> Entregue
  advanceOrder: (orderId: string) => Promise<ActionResult>;
  // image: foto do produto (opcional); só é usada quando o produto ainda não existe
  addStockItem: (item: StockItem, image?: File | null) => Promise<ActionResult>;
  // Edita nome, categoria, preço, descrição e imagem de um produto (vale para todas as variações)
  updateProduct: (productId: string, data: ProductEditData, image?: File | null) => Promise<ActionResult>;
  setStockQuantity: (sku: string, quantity: number) => Promise<ActionResult>;
  removeStockItem: (sku: string) => Promise<ActionResult>;
};

const OrdersContext = createContext<OrdersContextType | null>(null);

const errorMessage = (e: unknown) => (e instanceof ApiError ? e.message : "Algo deu errado. Tente novamente.");

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { isAdmin, requireLogin } = useAuth();
  const { products, reloadProducts, checkout } = useShop();
  const admin = useAdminData(isAdmin);

  // O estoque mudou: atualiza também o catálogo da loja
  async function refreshAfterStockChange() {
    await Promise.all([admin.reloadAll(), reloadProducts()]);
  }

  async function placeOrder(): Promise<ActionResult> {
    const message = "Faça login para finalizar o pedido.";
    if (!requireLogin(message)) return { ok: false, needsLogin: true, message };
    return checkout(); // cria pedido e itens na mesma transação, esvazia o carrinho e devolve o link do WhatsApp
  }

  async function advanceOrder(orderId: string): Promise<ActionResult> {
    const order = admin.orders.find((o) => o.id === orderId);
    if (!order) return { ok: false, message: "Pedido não encontrado." };

    let result: ActionResult;
    if (order.status === "Aguardando") result = await admin.confirmPayment(order); // confirma o pagamento e baixa o estoque
    else if (order.status === "Confirmado") result = await admin.advanceStatus(order, "Enviado");
    else if (order.status === "Enviado") result = await admin.advanceStatus(order, "Entregue");
    else return { ok: false, message: "Este pedido não pode avançar." };

    if (result.ok) await reloadProducts();
    return result;
  }

  // Cadastra uma variação nova. Se o produto ainda não existe, cria o produto antes.
  async function addStockItem(item: StockItem, image?: File | null): Promise<ActionResult> {
    const [color, size] = item.variation.split("/").map((part) => part.trim());
    if (!color || !size) return { ok: false, message: 'Informe a variação no formato "Cor / Tamanho".' };

    try {
      let productId = item.productId ? Number(item.productId) : NaN;

      if (!Number.isInteger(productId)) {
        const existing = products.find((p) => normalizeText(p.name) === normalizeText(item.product));
        productId = existing ? Number(existing.id) : NaN;
      }

      if (!Number.isInteger(productId)) {
        // Produto novo: se o admin escolheu uma imagem, envia primeiro e guarda o caminho no produto
        const uploaded = image ? ((await adminApi.uploadImage(image)) as { imageUrl: string }) : null;

        const created = (await adminApi.createProduct({
          name: item.product,
          price: item.price,
          category: item.category,
          stock: 0,
          image_url: uploaded?.imageUrl,
        })) as { product: { id: number } };
        productId = created.product.id;
      }

      await adminApi.createVariant({ sku: item.sku, size, color, stock: item.stock, ProductId: productId });
      await refreshAfterStockChange();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: errorMessage(e) };
    }
  }

  // Troca nome, categoria, preço, descrição e (opcionalmente) a imagem do produto
  async function updateProduct(productId: string, data: ProductEditData, image?: File | null): Promise<ActionResult> {
    const id = Number(productId);
    if (!Number.isInteger(id)) return { ok: false, message: "Produto inválido." };

    try {
      const body: Record<string, unknown> = { ...data };

      if (image) {
        const uploaded = (await adminApi.uploadImage(image)) as { imageUrl: string };
        body.image_url = uploaded.imageUrl;
      }

      await adminApi.updateProduct(id, body);
      await refreshAfterStockChange(); // estoque, painel e catálogo da loja mostram o preço e a imagem novos
      return { ok: true };
    } catch (e) {
      return { ok: false, message: errorMessage(e) };
    }
  }

  async function setStockQuantity(sku: string, quantity: number): Promise<ActionResult> {
    const row = admin.stock.find((r) => r.sku === sku);
    if (!row) return { ok: false, message: "Item de estoque não encontrado." };

    const result = await admin.updateStock(row, quantity);
    if (result.ok) await reloadProducts();
    return result;
  }

  async function removeStockItem(sku: string): Promise<ActionResult> {
    const row = admin.stock.find((r) => r.sku === sku);
    if (!row || row.variantId === undefined) return { ok: false, message: "Item de estoque não encontrado." };

    try {
      const response = (await adminApi.deleteVariant(row.variantId)) as { message?: string };
      await refreshAfterStockChange();
      return { ok: true, message: response.message }; // avisa também quando o produto foi removido junto
    } catch (e) {
      return { ok: false, message: errorMessage(e) };
    }
  }

  return (
    <OrdersContext.Provider
      value={{
        orders: isAdmin ? admin.orders : [],
        stock: isAdmin ? admin.stock : [],
        dashboard: isAdmin ? admin.dashboard : null,
        loading: admin.loading,
        error: admin.error,
        reload: admin.reloadAll,
        placeOrder,
        advanceOrder,
        addStockItem,
        updateProduct,
        setStockQuantity,
        removeStockItem,
      }}
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
