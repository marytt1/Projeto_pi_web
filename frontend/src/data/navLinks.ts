import type { NavLink } from "../types/nav";

// Links do menu no topo (desktop)
export const NAV_LINKS: NavLink[] = [
  { label: "Catálogo", href: "#" },
  { label: "Provador", href: "#" },
  { label: "Novidades", href: "#" },
];

// Links do menu "drawer" (mobile)
export const DRAWER_LINKS: NavLink[] = [
  ...NAV_LINKS,
  { label: "Contato", href: "#" },
];
