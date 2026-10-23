import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

type RequireAuthProps = {
  adminOnly?: boolean;
  children: ReactNode;
};

// Função como guarda de rota em que envolve uma página que só usuários autorizados podem ver
export default function RequireAuth({ adminOnly = false, children }: RequireAuthProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return <>{children}</>;
}