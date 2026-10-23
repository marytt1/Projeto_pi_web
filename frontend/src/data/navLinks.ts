import type { NavLink } from "../types/nav";

// Links de navegação
export const NAV_LINKS: NavLink[] = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Provador", href: "/#guia-tamanhos" },
  { label: "Novidades", href: "/#produtos" },
  { label: "Contato", href: "#contato" },
];

// O menu lateral usa os mesmos links da barra horizontal
export const DRAWER_LINKS: NavLink[] = NAV_LINKS;