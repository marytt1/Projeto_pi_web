import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../types/product";
import type { CartItem } from "../types/cart";
import type { FavoriteItem } from "../types/favorite";
import { getColorName } from "../data/colors";
import { useAuth } from "./AuthContext";

type ShopContextType = {
  cart: CartItem[];
  favorites: FavoriteItem[];
  
  addToCart: (product: Product, size?: string, color?: string) => boolean;
  changeQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  toggleFavorite: (product: Product, size?: string, color?: string) => boolean;
  isFavorite: (productId: string) => boolean;
  removeFavorite: (id: string) => void;
};

const ShopContext = createContext<ShopContextType | null>(null);

// Estado global do carrinho e dos favoritos
export function ShopProvider({ children }: { children: ReactNode }) {
  const { user, requireLogin } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const [lastUserEmail, setLastUserEmail] = useState(user?.email ?? null);
  if ((user?.email ?? null) !== lastUserEmail) {
    setLastUserEmail(user?.email ?? null);
    setCart([]);
    setFavorites([]);
  }

  function addToCart(product: Product, size = product.sizes[0], color = product.colors[0]) {
    if (!requireLogin("Faça login para adicionar peças ao carrinho.")) return false;

    const id = `${product.id}-${size}-${color}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);

      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      const newItem: CartItem = {
        id,
        name: product.name,
        image: product.image,
        size,
        colorName: getColorName(color),
        price: product.price,
        quantity: 1,
      };
      return [...prev, newItem];
    });

    return true;
  }

  function changeQuantity(id: string, delta: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function toggleFavorite(product: Product, size = product.sizes[0], color = product.colors[0]) {
    if (!requireLogin("Faça login para favoritar peças.")) return false;

    setFavorites((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }

      const newItem: FavoriteItem = {
        id: product.id,
        name: product.name,
        image: product.image,
        size,
        colorName: getColorName(color),
        price: product.price,
      };
      return [...prev, newItem];
    });

    return true;
  }

  function isFavorite(productId: string) {
    return favorites.some((item) => item.id === productId);
  }

  function removeFavorite(id: string) {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <ShopContext.Provider
      value={{
        cart,
        favorites,
        addToCart,
        changeQuantity,
        removeFromCart,
        toggleFavorite,
        isFavorite,
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