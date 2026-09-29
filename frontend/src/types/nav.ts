/*  Um item de navegação: usado no menu do topo (desktop) e no menu
    "drawer" (mobile). Também servirá de base quando as próximas páginas
    forem criadas (o href passa a apontar para uma rota real).
*/
export type NavLink = {
  label: string;
  href: string;
};
