export type UserRole = "admin" | "cliente";

export type User = {
  id?: number; 
  name: string;
  email: string;
  password?: string; 
  role: UserRole;
};
