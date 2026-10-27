import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Menu, Heart, ShoppingBag, User, X, ChevronRight } from "lucide-react";
import type { NavLink as NavLinkType } from "../types/nav";
import { NAV_LINKS, DRAWER_LINKS } from "../data/navLinks";
import { useShop } from "./ShopContext";
import { useAuth } from "./AuthContext";
import CartDrawer from "./CartDrawer";
import FavoritesDrawer from "./FavoritesDrawer";
import AccountMenu from "./AccountMenu";
import SearchBar from "./SearchBar";

type HeaderProps = {
  navLinks?: NavLinkType[];
  drawerLinks?: NavLinkType[];
};

type OpenPopover = "cart" | "favorites" | "account" | null;

// Componente do Cabeçalho principal com barra de avisos, busca, menus retráteis de navegação, carrinho, favoritos, conta e modal de autenticação
export default function Header({
  navLinks = NAV_LINKS,
  drawerLinks = DRAWER_LINKS,
}: HeaderProps) {
  
  const navigate = useNavigate();

  // Estado: menu lateral (drawer) aberto ou fechado
  const [menuOpen, setMenuOpen] = useState(false);

  const { cart, favorites, changeQuantity, removeFromCart, clearCart, removeFavorite } = useShop();

  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);

  const { user, isAdmin, logout, openAuthModal } = useAuth();

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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function togglePopover(popover: OpenPopover) {
    setOpenPopover((current) => (current === popover ? null : popover));
  }

  // Ícone de usuário: logado abre o menu da conta; visitante abre o login
  function handleUserIconClick() {
    if (user) {
      togglePopover("account");
    } else {
      openAuthModal("entrar");
    }
  }

  // Favoritos e carrinho exigem login: visitante recebe o modal de login
  function handleProtectedIconClick(popover: "cart" | "favorites", message: string) {
    if (!user) {
      openAuthModal("entrar", message);
      return;
    }
    togglePopover(popover);
  }

  // Sair: encerra a sessão e volta para a Home como visitante
  function handleLogout() {
    logout();
    setOpenPopover(null);
    setMenuOpen(false);
    navigate("/");
  }

  // Busca do site: leva pro catálogo com o termo na URL (?busca=...).
  function handleSearch(term: string) {
    setOpenPopover(null);
    setMenuOpen(false);
    navigate(term ? `/catalogo?busca=${encodeURIComponent(term)}` : "/catalogo");
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      
      <div className="hidden md:flex items-center justify-center gap-8 bg-[#5c0f1c] text-white text-xs py-2 px-4">
        <span>BRL (R$) / PT-BR</span>
        <span>Troca gratuita em até 30 dias</span>
        <span>Frete grátis a partir de R$600,00</span>
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

          
          <Link to="/" className="font-serif italic text-3xl text-[#8b1538] tracking-wide">
            La Rose
          </Link>
        </div>

        
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium tracking-wide">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              end
              className={({ isActive }) =>
                // links com "#" (âncora) não ficam marcados como ativos
                isActive && !link.href.includes("#")
                  ? "text-[#8b1538]"
                  : "text-[#3a3a3a] hover:text-[#8b1538] transition-colors"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        
        <div ref={iconsRef} className="flex items-center gap-5 relative">
          
          <SearchBar onSearch={handleSearch} className="hidden lg:flex w-64" />

          
          <div className="relative">
            <button
              onClick={() => handleProtectedIconClick("favorites", "Faça login para ver seus favoritos.")}
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
              onClick={() => handleProtectedIconClick("cart", "Faça login para ver seu carrinho.")}
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
                onChangeQuantity={changeQuantity}
                onRemove={removeFromCart}
                onClear={clearCart}
                // "Finalizar" leva pra rota /carrinho e fecha o popover
                onCheckout={() => {
                  setOpenPopover(null);
                  navigate("/carrinho");
                }}
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
            {openPopover === "account" && user && (
              <AccountMenu
                userName={user.name.split(" ")[0]}
                isAdmin={isAdmin}
                onClose={() => setOpenPopover(null)}
                onOpenAdmin={() => {
                  setOpenPopover(null);
                  navigate("/admin");
                }}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </div>

      
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

        
        <div className="px-6 pt-4 lg:hidden">
          <SearchBar onSearch={handleSearch} className="flex w-full" />
        </div>

        
        <nav className="flex-1 overflow-y-auto py-2">
          {drawerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-6 py-4 text-sm text-[#3a3a3a] border-b border-neutral-50 hover:bg-neutral-50 transition-colors"
            >
              {link.label}
              <ChevronRight size={16} className="text-neutral-300" />
            </Link>
          ))}
        </nav>

        <div className="px-6 py-6 border-t border-neutral-100 flex flex-col gap-3">
          {user ? (
            <>
              
              <p className="text-xs text-neutral-400">Olá, {user.name.split(" ")[0]}</p>
              <Link
                to="/conta"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center text-sm font-medium py-3 rounded-full border border-[#8b1538] text-[#8b1538] hover:bg-[#faf1f0] transition-colors"
              >
                Configurações da Conta
              </Link>
              
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-sm font-medium py-3 rounded-full bg-[#8b1538] text-white hover:bg-[#71102d] transition-colors"
                >
                  Painel Administrativo
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-sm font-medium py-2 text-[#8b1538]"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              
              <button
                onClick={() => {
                  openAuthModal("entrar");
                  setMenuOpen(false);
                }}
                className="w-full text-sm font-medium py-3 rounded-full border border-[#8b1538] text-[#8b1538] hover:bg-[#faf1f0] transition-colors"
              >
                Entrar na Conta
              </button>
              <button
                onClick={() => {
                  openAuthModal("cadastrar");
                  setMenuOpen(false);
                }}
                className="w-full text-sm font-medium py-3 rounded-full bg-[#8b1538] text-white hover:bg-[#71102d] transition-colors"
              >
                Criar Conta Grátis
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}