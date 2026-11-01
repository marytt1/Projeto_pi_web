import type { Product, ProductBadge, ProductCategory, ProductVariant, ColorOption } from "../types/product";
import type { CartItem } from "../types/cart";
import type { FavoriteItem } from "../types/favorite";
import { imageUrl } from "./api";
import type { Order, OrderStatus } from "../types/order";
import type { StockItem } from "../types/stock";
import type { User } from "../types/user";

// formatos da API
export type ApiVariant = { id: number; sku: string; size: string; color: string; stock: number };

export type ApiProduct = {
  id: number;
  name: string;
  price: number;
  oldPrice?: number | null;
  category: string;
  image_url: string | null;
  createdAt: string;
  Variants?: ApiVariant[];
};

export type ApiQuoteItem = {
  variantId: number;
  productId?: number;
  name?: string;
  imageUrl?: string | null;
  color?: string;
  size?: string;
  price?: number;
  requestedQuantity: number;
  quantity: number;
  available?: number;
  status: "ok" | "quantity_adjusted" | "out_of_stock" | "not_found";
};

export type ApiFavorite = {
  favoriteId: number;
  product: { id: number; name: string; price: number; imageUrl: string | null; category: string; colors: string[] };
};

// cores
const COLOR_HEX: Record<string, string> = {
  Preto: "#111111",
  Borgonha: "#8b1538",
  Pink: "#e0399c",
  Rosa: "#e76ea3",
  "Rosa Claro": "#f2b9c9",
  Vinho: "#3a1116",
};
const FALLBACK_HEX = "#cccccc";
export const colorHex = (name: string) => COLOR_HEX[name] ?? FALLBACK_HEX;

// tamanhos
const SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XG"];

function compareSizes(a: string, b: string) {
  const ia = SIZE_ORDER.indexOf(a);
  const ib = SIZE_ORDER.indexOf(b);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return Number(a) - Number(b) || a.localeCompare(b); // numeração: 34, 36, 38...
}

// selos (badge)
const LOW_STOCK_TOTAL = 5; 
const NEW_DAYS = 30; 

function buildBadge(p: ApiProduct, totalStock: number): ProductBadge | undefined {
  if (p.oldPrice && p.oldPrice > p.price) return { label: "Promoção", tone: "promo" };
  if (totalStock > 0 && totalStock <= LOW_STOCK_TOTAL) return { label: "Pouco Estoque", tone: "estoque" };
  const ageDays = (Date.now() - new Date(p.createdAt).getTime()) / 86_400_000;
  if (ageDays <= NEW_DAYS) return { label: "Novo", tone: "novo" };
  return undefined; 
}

// produto
export function toProduct(p: ApiProduct): Product {
  const variants = p.Variants ?? [];
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  const colorNames = [...new Set(variants.map((v) => v.color))];
  const colorOptions: ColorOption[] = colorNames.map((name) => ({ name, hex: colorHex(name) }));
  const sizes = [...new Set(variants.map((v) => v.size))].sort(compareSizes);

  return {
    id: String(p.id),
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice ?? undefined,
    category: p.category as ProductCategory,
    badge: buildBadge(p, totalStock),
    colors: colorOptions.map((c) => c.hex),
    sizes,
    image: imageUrl(p.image_url) ?? "",
    soldOut: variants.length === 0 || totalStock === 0,
    colorOptions,
    variants: variants.map(
      (v): ProductVariant => ({ id: String(v.id), size: v.size, colorName: v.color, stock: v.stock })
    ),
  };
}

// Descobre qual variação o cliente escolheu (cor + tamanho). O id dela vai para cart.add(Number(id)).
export function findVariant(product: Product, size: string, colorName: string): ProductVariant | null {
  return product.variants?.find((v) => v.size === size && v.colorName === colorName) ?? null;
}

// carrinho
export function toCartItems(items: ApiQuoteItem[]): CartItem[] {
  return items
    .filter((q) => q.status !== "not_found")
    .map((q) => ({
      id: String(q.variantId),
      productId: String(q.productId ?? ""),
      name: q.name ?? "",
      image: imageUrl(q.imageUrl) ?? "",
      size: q.size ?? "",
      colorName: q.color ?? "",
      price: q.price ?? 0,
      quantity: q.quantity,
      available: q.available,
      status: q.status === "not_found" ? undefined : q.status,
    }));
}

export const notFoundVariantIds = (items: ApiQuoteItem[]): number[] =>
  items.filter((q) => q.status === "not_found").map((q) => q.variantId);

// favoritos
export function toFavoriteItem(f: ApiFavorite): FavoriteItem {
  return {
    id: String(f.product.id),
    name: f.product.name,
    image: imageUrl(f.product.imageUrl) ?? "",
    price: f.product.price,
    colors: f.product.colors,
  };
}

// ADMIN
export type ApiOrder = {
  id: number;
  code: string; 
  customer: { id: number | null; name: string | null; email: string | null } | null;
  items: {
    productId: number | null;
    name: string;
    sku: string | null;
    color: string | null;
    size: string | null;
    quantity: number;
    price: number;
    imageUrl: string | null;
  }[];
  total: number;
  status: OrderStatus;
  date: string;
  paidAt: string | null;
};

export type ApiStockRow = {
  id: number; // id da variação
  sku: string;
  productId: number | null;
  product: string | null;
  variation: string; // "Borgonha / M"
  category: string | null;
  price: number | null;
  stock: number;
  soldOut: boolean;
  lowStock: boolean;
};

export type ApiUser = { id: number; name: string; email: string; isAdmin?: boolean };

export type ApiDashboard = {
  salesToday: { total: number; orders: number };
  pendingOrders: number;
  stockAlerts: { count: number; limit: number };
  latestOrders: ApiOrder[];
};

export type Dashboard = Omit<ApiDashboard, "latestOrders"> & { latestOrders: Order[] };

function formatApiDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function toOrder(o: ApiOrder): Order {
  return {
    id: o.code,
    apiId: o.id,
    customerName: o.customer?.name ?? "Cliente removido",
    customerEmail: o.customer?.email ?? "",
    items: o.items.map((i) => ({
      productId: String(i.productId ?? ""),
      name: i.name,
      image: imageUrl(i.imageUrl) ?? "",
      size: i.size ?? "",
      colorName: i.color ?? "",
      quantity: i.quantity,
      price: i.price,
    })),
    total: o.total,
    date: formatApiDate(o.date), // "dd/mm/aaaa"
    status: o.status,
    // O estoque é baixado quando o pagamento é confirmado
    stockDeducted: o.status !== "Aguardando" && o.status !== "Cancelado",
  };
}

export function toStockItem(r: ApiStockRow): StockItem {
  return {
    sku: r.sku,
    variantId: r.id,
    productId: r.productId != null ? String(r.productId) : undefined,
    product: r.product ?? "",
    variation: r.variation,
    category: r.category ?? "",
    price: r.price ?? 0,
    stock: r.stock,
  };
}

export function toUser(u: ApiUser): User {
  return { id: u.id, name: u.name, email: u.email, role: u.isAdmin ? "admin" : "cliente" };
}

export function toDashboard(d: ApiDashboard): Dashboard {
  return { ...d, latestOrders: d.latestOrders.map(toOrder) };
}
