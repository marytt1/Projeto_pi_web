import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import type { Product } from "../types/product";
import type { CartItem } from "../types/cart";
import type { FavoriteItem } from "../types/favorite";
import { getColorName } from "../data/colors";
import { findVariant } from "../services/adapters";
import { useShopData } from "../hooks/userShopData";
import type { ActionResult } from "../hooks/useShopData";
import { useAuth } from "./AuthContext";

type ShopContextType = {
  products: Product[];
  loadingProducts: boolean;
  productsError: string | null;
  reloadProducts: () => Promise<void>;

  // carrinho
  cart: CartItem[];
  cartNotice: string | null;
  canCheckout: boolean;
  addToCart: (product: Product, size?: string, color?: string) => boolean;
  changeQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void; // esvazia o carrinho inteiro
  checkout: () => Promise<ActionResult>; 
  reloadCart: () => Promise<void>;

  // favoritos
  favorites: FavoriteItem[];
  toggleFavorite: (product: Product, size?: string, color?: string) => boolean;
  isFavorite: (productId: string) => boolean;
  removeFavorite: (id: string) => void;
};

const ShopContext = createContext<ShopContextType | null>(null);

// Nome da cor (ex.: "Preto") a partir do código hex que o card usa
function colorNameFor(product: Product, colorHex: string) {
  return product.colorOptions?.find((c) => c.hex === colorHex)?.name ?? getColorName(colorHex);
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user, requireLogin } = useAuth();
  const data = useShopData();
  const { clearCart: emptyCart, reloadCart, reloadFavorites } = data;

  const userId = user?.id ?? null;

  // Quando entra ou sai alguém: sem login o carrinho fica vazio; com login carrega o da pessoa.
  // Os favoritos são recarregados nos dois casos.
  useEffect(() => {
    if (userId === null) emptyCart();
    else reloadCart();
    reloadFavorites();
  }, [userId, emptyCart, reloadCart, reloadFavorites]);

  // Devolve false se a pessoa não está logada ou se a combinação cor/tamanho não tem estoque
  function addToCart(product: Product, size = product.sizes[0], color = product.colors[0]) {
    if (!requireLogin("Faça login para adicionar peças ao carrinho.")) return false;

    const variant = findVariant(product, size, colorNameFor(product, color));
    if (!variant || variant.stock <= 0) return false;

    // O id do item do carrinho é o id da variação: a mesma peça em outro tamanho/cor é outro item
    void data.addToCart(product, size, variant.colorName);
    return true;
  }

  function changeQuantity(id: string, delta: number) {
    const item = data.cartItems.find((i) => i.id === id);
    if (!item) return;
    void data.setQuantity(id, Math.max(1, item.quantity + delta));
  }

  function removeFromCart(id: string) {
    void data.removeItem(id);
  }

  // Remove todos os itens do carrinho
  function clearCart() {
    void emptyCart();
  }

  function toggleFavorite(product: Product, _size?: string, _color?: string) {
    if (!requireLogin("Faça login para favoritar peças.")) return false;

    void data.toggleFavorite(product.id);
    return true;
  }

  function removeFavorite(id: string) {
    if (data.isFavorite(id)) void data.toggleFavorite(id); 
  }

  return (
    <ShopContext.Provider
      value={{
        products: data.products,
        loadingProducts: data.loadingProducts,
        productsError: data.productsError,
        reloadProducts: data.reloadProducts,
        cart: data.cartItems,
        cartNotice: data.cartNotice,
        canCheckout: data.canCheckout,
        addToCart,
        changeQuantity,
        removeFromCart,
        clearCart,
        checkout: data.checkout,
        reloadCart,
        favorites: data.favoriteItems,
        toggleFavorite,
        isFavorite: data.isFavorite,
        removeFavorite,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop precisa ser usado dentro de <ShopProvider>");
  }
  return context;
}
