import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
import { ApiError, auth, session } from "../services/api";
import { toUser, type ApiUser } from "../services/adapters";

// Tamanho mínimo da senha
const MIN_PASSWORD = 8;

// Resultado padrão das ações: deu certo ou não + mensagem pra mostrar na tela
export type AuthResult = { ok: boolean; message: string };

// Estado do modal de login
type AuthModalState = { mode: "entrar" | "cadastrar"; message?: string } | null;

type AuthContextType = {
  user: User | null; // null = visitante
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;

  // Pede o link: a API envia o e-mail. Não devolve token (ele só existe dentro do e-mail)
  requestPasswordReset: (email: string) => Promise<AuthResult & { token?: string }>;

  // Na página /redefinir-senha
  isResetTokenValid: (token: string) => boolean;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;

  // modal de login (aberto de qualquer lugar do site)
  authModal: AuthModalState;
  openAuthModal: (mode?: "entrar" | "cadastrar", message?: string) => void;
  closeAuthModal: () => void;

  requireLogin: (message?: string) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const isValidEmail = (email: string) => email.includes("@") && email.includes(".");

const apiMessage = (e: unknown) => (e instanceof ApiError ? e.message : "Algo deu errado. Tente novamente.");

// Quem estava logado antes de recarregar a página (a sessão fica guardada no navegador)
function loadUser(): User | null {
  const saved = session.getUser() as ApiUser | null;
  return saved ? toUser(saved) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const [authModal, setAuthModal] = useState<AuthModalState>(null);

  useEffect(() => {
    function onExpired() {
      setUser(null);
      setAuthModal({ mode: "entrar", message: "Sua sessão expirou. Entre novamente." });
    }
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  async function login(email: string, password: string): Promise<AuthResult> {
    if (!email.trim() || !password) return { ok: false, message: "Informe email e senha." };

    try {
      const apiUser = (await auth.login(email.trim(), password)) as ApiUser;
      setUser(toUser(apiUser));
      return { ok: true, message: "Login realizado." };
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 422)) {
        return { ok: false, message: "Email ou senha incorretos." };
      }
      return { ok: false, message: apiMessage(e) };
    }
  }

  async function register(name: string, email: string, password: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) return { ok: false, message: "Informe seu nome completo." };
    if (!isValidEmail(cleanEmail)) return { ok: false, message: "Informe um email válido." };
    if (password.length < MIN_PASSWORD) {
      return { ok: false, message: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.` };
    }

    try {
      // Todo cadastro novo é "cliente"
      await auth.register(name.trim(), cleanEmail, password);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        return { ok: false, message: "Já existe uma conta com esse email." };
      }
      return { ok: false, message: apiMessage(e) };
    }

    // Depois de cadastrar, já entra na conta
    const result = await login(cleanEmail, password);
    return { ok: result.ok, message: result.ok ? "Conta criada." : result.message };
  }

  function logout() {
    auth.logout();
    setUser(null);
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    if (!user) return { ok: false, message: "Você precisa estar logado." };
    if (newPassword.length < MIN_PASSWORD) {
      return { ok: false, message: `A nova senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.` };
    }

    try {
      await auth.changePassword(currentPassword, newPassword);
      return { ok: true, message: "Senha alterada com sucesso!" };
    } catch (e) {
      return { ok: false, message: apiMessage(e) };
    }
  }

  // A API gera o token e envia o link por e-mail. A resposta é sempre a mesma, exista a conta ou não
  async function requestPasswordReset(email: string): Promise<AuthResult & { token?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) return { ok: false, message: "Informe um email válido." };

    try {
      await auth.forgotPassword(cleanEmail);
      return { ok: true, message: "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha." };
    } catch (e) {
      return { ok: false, message: apiMessage(e) };
    }
  }

  // A API só confere o token na hora de salvar a senha (resetPassword)
  function isResetTokenValid(token: string): boolean {
    return token.trim().length > 0;
  }

  // Troca a senha com o token que veio no link do e-mail
  async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    if (newPassword.length < MIN_PASSWORD) {
      return { ok: false, message: `A nova senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.` };
    }

    try {
      await auth.resetPassword(token, newPassword);
      return { ok: true, message: "Senha redefinida com sucesso!" };
    } catch (e) {
      return { ok: false, message: apiMessage(e) };
    }
  }

  function openAuthModal(mode: "entrar" | "cadastrar" = "entrar", message?: string) {
    setAuthModal({ mode, message });
  }

  function closeAuthModal() {
    setAuthModal(null);
  }

  function requireLogin(message = "Faça login para continuar.") {
    if (user) return true;
    openAuthModal("entrar", message);
    return false;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        changePassword,
        requestPasswordReset,
        isResetTokenValid,
        resetPassword,
        authModal,
        openAuthModal,
        closeAuthModal,
        requireLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  }
  return context;
}
