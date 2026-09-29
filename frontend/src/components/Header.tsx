import { useState, useRef, useEffect } from "react";
import { Menu, Heart, ShoppingBag, User, Search, X, ChevronRight } from "lucide-react";
import type { NavLink } from "../types/nav";
import { NAV_LINKS, DRAWER_LINKS } from "../data/navLinks";
import type { CartItem } from "../types/cart";
import { INITIAL_CART } from "../data/cart";
import type { FavoriteItem } from "../types/favorite";
import { INITIAL_FAVORITES } from "../data/favorites";
import CartDrawer from "./CartDrawer";
import FavoritesDrawer from "./FavoritesDrawer";
import AccountMenu from "./AccountMenu";
import AuthModal from "./AuthModal";

type HeaderProps = {
  navLinks?: NavLink[];
  drawerLinks?: NavLink[];
  onOpenAdmin?: () => void;
};

type OpenPopover = "cart" | "favorites" | "account" | null;

// Componente do Cabeçalho principal com barra de avisos, busca, menus retráteis de navegação, carrinho, favoritos, conta e modal de autenticação
export default function Header({
  navLinks = NAV_LINKS,
  drawerLinks = DRAWER_LINKS,
  onOpenAdmin,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(INITIAL_FAVORITES);

  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const [isLoggedIn] = useState(true);

  const iconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openPopover) return;

    function handleClickOutside(event: MouseEvent) {
      if (iconsRef.current && !iconsRef.current.contains(event.target as Node)) {
        setOpenPopover(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPopover]);

  const [authModalMode, setAuthModalMode] = useState<"entrar" | "cadastrar" | null>(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function togglePopover(popover: OpenPopover) {
    setOpenPopover((current) => (current === popover ? null : popover));
  }

  function handleUserIconClick() {
    if (isLoggedIn) {
      togglePopover("account");
    } else {
      setAuthModalMode("entrar");
    }
  }

  function changeCartQuantity(id: string, delta: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  }

  function removeCartItem(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function removeFavorite(id: string) {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="hidden md:flex items-center justify-center gap-8 bg-[#5c0f1c] text-white text-xs py-2 px-4">
        <span>BRL (R$) / PT-BR</span>
        <span>Troca gratuita em até 30 dias</span>
        <span>Descubra seu tamanho ideal La Rose</span>
        <span>Atendimento Presencial em Santa Cruz das Palmeiras - SP</span>
      </div>

      <div className="flex items-center justify-between px-6 md:px-10 py-4">
        <button
          className="md:hidden text-[#5c0f1c]"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-10">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            className="hidden md:inline-block text-[#5c0f1c] hover:text-[#8b1538]"
          >
            <Menu size={22} />
          </button>
          <h1 className="font-serif italic text-3xl text-[#8b1538] tracking-wide">
            La Rose
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-10 text-sm font-medium tracking-wide text-[#3a3a3a]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#8b1538] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div ref={iconsRef} className="flex items-center gap-5 relative">
          <div className="hidden lg:flex items-center gap-2 border border-neutral-200 rounded-full px-4 py-2 w-64">
            <Search size={16} className="text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar peças..."
              className="text-sm outline-none w-full placeholder:text-neutral-400"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => togglePopover("favorites")}
              aria-label="Favoritos"
              className="text-[#3a3a3a] hover:text-[#8b1538]"
            >
              <Heart size={20} />
            </button>
            {openPopover === "favorites" && (
              <FavoritesDrawer
                items={favorites}
                onClose={() => setOpenPopover(null)}
                onRemove={removeFavorite}
              />
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => togglePopover("cart")}
              aria-label="Carrinho"
              className="relative text-[#3a3a3a] hover:text-[#8b1538]"
            >
              <ShoppingBag size={20} />
              <span className="absolute -top-2 -right-2 bg-[#8b1538] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
            {openPopover === "cart" && (
              <CartDrawer
                items={cart}
                onClose={() => setOpenPopover(null)}
                onChangeQuantity={changeCartQuantity}
                onRemove={removeCartItem}
              />
            )}
          </div>

           <div className="relative">
            <button
              onClick={handleUserIconClick}
              aria-label="Conta"
              className="text-[#3a3a3a] hover:text-[#8b1538]"
            >
              <User size={20} />
            </button>
            {openPopover === "account" && (
              <AccountMenu
                userName="Admin"
                isAdmin
                onClose={() => setOpenPopover(null)}
                onOpenAdmin={onOpenAdmin}
              />
            )}
          </div>
        </div>
      </div>

      {authModalMode && (
        <AuthModal initialMode={authModalMode} onClose={() => setAuthModalMode(null)} />
      )}

       <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-50 shadow-xl flex flex-col transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <h2 className="font-serif italic text-2xl text-[#8b1538]">La Rose</h2>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
            className="text-neutral-400 hover:text-[#3a3a3a]"
          >
            <X size={22} />
          </button>
        </div>

       <nav className="flex-1 overflow-y-auto py-2">
          {drawerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center justify-between px-6 py-4 text-sm text-[#3a3a3a] border-b border-neutral-50 hover:bg-neutral-50 transition-colors"
            >
              {link.label}
              <ChevronRight size={16} className="text-neutral-300" />
            </a>
          ))}
        </nav>

         <div className="px-6 py-6 border-t border-neutral-100 flex flex-col gap-3">
          <button
            onClick={() => {
              setAuthModalMode("entrar");
              setMenuOpen(false);
            }}
            className="w-full text-sm font-medium py-3 rounded-full border border-[#8b1538] text-[#8b1538] hover:bg-[#faf1f0] transition-colors"
          >
            Entrar na Conta
          </button>
          <button
            onClick={() => {
              setAuthModalMode("cadastrar");
              setMenuOpen(false);
            }}
            className="w-full text-sm font-medium py-3 rounded-full bg-[#8b1538] text-white hover:bg-[#71102d] transition-colors"
          >
            Criar Conta Grátis
          </button>
        </div>
      </div>
    </header>
  );
}