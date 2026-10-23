// Perfis de acesso: "admin" enxerga o Painel Administrativo, "cliente" é um usuário logado comum e quem não está logado é "visitante"
export type UserRole = "admin" | "cliente";

export type User = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};