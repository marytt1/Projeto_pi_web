import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  auth,
  cart as cartApi,
  favorites as favoritesApi,
  orders as ordersApi,
  products as productsApi,
} from "../services/api";
import {
  findVariant,
  notFoundVariantIds,
  toCartItems,
  toFavoriteItem,
  toProduct,
  type ApiFavorite,
  type ApiProduct,
  type ApiQuoteItem,
} from "../services/adapters";
import type { CartItem } from "../types/cart";
import type { FavoriteItem } from "../types/favorite";
import type { Product } from "../types/product";

export type ActionResult = {
  ok: boolean;
  message?: string;
  needsLogin?: boolean; // true: abra a tela de login
  whatsappUrl?: string | null; // só no checkout
  orderCode?: string; // só no checkout
};

const errorMessage = (e: unknown) => (e instanceof ApiError ? e.message : "Algo deu errado. Tente novamente.");

export function useShopData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [canCheckout, setCanCheckout] = useState(false);
  const [cartNotice, setCartNotice] = useState<string | null>(null); // aviso quando preço/estoque mudou

  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const data = (await productsApi.list()) as { products: ApiProduct[] };
      setProducts(data.products.map(toProduct));
    } catch (e) {
      setProductsError(errorMessage(e));
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const quote = (await cartApi.quote()) as { items: ApiQuoteItem[]; subtotal: number; canCheckout: boolean };

      // Variações que não existem mais saem do carrinho local
      notFoundVariantIds(quote.items).forEach((id) => cartApi.remove(id));

      setCartItems(toCartItems(quote.items));
      setSubtotal(quote.subtotal);
      setCanCheckout(quote.canCheckout);
      setCartNotice(
        quote.items.some((i) => i.status !== "ok")
          ? "Alguns itens do carrinho mudaram de estoque ou deixaram de existir. Confira antes de finalizar."
          : null
      );
    } catch (e) {
      setCartNotice(errorMessage(e));
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!auth.isLoggedIn()) {
      setFavoriteItems([]);
      return;
    }
    try {
      const data = (await favoritesApi.list()) as { favorites: ApiFavorite[] };
      setFavoriteItems(data.favorites.map(toFavoriteItem));
    } catch {
      setFavoriteItems([]);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    refreshCart();
    loadFavorites();

    // Sessão expirou (a API devolveu 401): esvazia os favoritos
    const onExpired = () => setFavoriteItems([]);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [loadProducts, refreshCart, loadFavorites]);

  const addToCart = useCallback(
    async (product: Product, size: string, colorName: string): Promise<ActionResult> => {
      const variant = findVariant(product, size, colorName); 
      if (!variant) return { ok: false, message: "Essa combinação de cor e tamanho não está disponível." };
      if (variant.stock <= 0) return { ok: false, message: "Esse tamanho está esgotado." };

      cartApi.add(Number(variant.id), 1);
      await refreshCart();
      return { ok: true };
    },
    [refreshCart]
  );

  // "+" e "-" do carrinho. O id do item do carrinho é o id da variação.
  const setQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      cartApi.setQuantity(Number(itemId), quantity);
      await refreshCart();
    },
    [refreshCart]
  );

  // Lixeira do carrinho
  const removeItem = useCallback(
    async (itemId: string) => {
      cartApi.remove(Number(itemId));
      await refreshCart();
    },
    [refreshCart]
  );

  // Esvazia o carrinho inteiro
  const clearCart = useCallback(async () => {
    cartApi.clear();
    await refreshCart();
  }, [refreshCart]);

  // Botão "Finalizar": exige login. Depois, abra o WhatsApp da loja
  const checkout = useCallback(async (): Promise<ActionResult> => {
    if (!auth.isLoggedIn()) return { ok: false, needsLogin: true, message: "Entre na sua conta para finalizar o pedido." };
    try {
      const data = (await ordersApi.checkout()) as { order: { code: string }; whatsapp: { url: string } | null };
      await refreshCart();
      return { ok: true, whatsappUrl: data.whatsapp?.url ?? null, orderCode: data.order.code };
    } catch (e) {
      await refreshCart();
      return { ok: false, message: errorMessage(e) };
    }
  }, [refreshCart]);

  const favoriteIds = useMemo(() => new Set(favoriteItems.map((f) => f.id)), [favoriteItems]);
  const isFavorite = useCallback((productId: string) => favoriteIds.has(productId), [favoriteIds]);

  const toggleFavorite = useCallback(
    async (productId: string): Promise<ActionResult> => {
      if (!auth.isLoggedIn()) return { ok: false, needsLogin: true, message: "Entre na sua conta para favoritar." };
      try {
        await favoritesApi.toggle(Number(productId));
        await loadFavorites();
        return { ok: true };
      } catch (e) {
        return { ok: false, message: errorMessage(e) };
      }
    },
    [loadFavorites]
  );

  return {
    // catálogo
    products, loadingProducts, productsError, reloadProducts: loadProducts,
    // carrinho
    cartItems, subtotal, canCheckout, cartNotice, addToCart, setQuantity, removeItem, clearCart, checkout,
    reloadCart: refreshCart,
    // favoritos
    favoriteItems, isFavorite, toggleFavorite, reloadFavorites: loadFavorites,
  };
}