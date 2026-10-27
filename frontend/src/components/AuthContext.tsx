import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
import { INITIAL_USERS } from "../data/users";

const USERS_KEY = "larose_users";
const SESSION_KEY = "larose_session";
const RESETS_KEY = "larose_resets";
const RESET_DURATION_MS = 15 * 60 * 1000; // o link vale por 15 minutos

// Pedido de recuperação de senha: o "token" é o código que iria no link do email
type ResetRequest = { token: string; email: string; expiresAt: number };

function loadResets(): ResetRequest[] {
  try {
    const raw = localStorage.getItem(RESETS_KEY);
    return raw ? (JSON.parse(raw) as ResetRequest[]) : [];
  } catch {
    return [];
  }
}

function saveResets(list: ResetRequest[]) {
  localStorage.setItem(RESETS_KEY, JSON.stringify(list));
}

// Resultado padrão das ações: deu certo ou não + mensagem pra mostrar na tela
export type AuthResult = { ok: boolean; message: string };

// Estado do modal de login
type AuthModalState = { mode: "entrar" | "cadastrar"; message?: string } | null;

type AuthContextType = {
  user: User | null; // null = visitante
  isAdmin: boolean;
  login: (email: string, password: string) => AuthResult;
  register: (name: string, email: string, password: string) => AuthResult;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => AuthResult;

  // Primeiro pede o link, e devolve o "token" que iria no email
  requestPasswordReset: (email: string) => AuthResult & { token?: string };

  // Depois (vai para página /redefinir-senha) confere o link e troca a senha
  isResetTokenValid: (token: string) => boolean;
  resetPassword: (token: string, newPassword: string) => AuthResult;

  // modal de login (aberto de qualquer lugar do site)
  authModal: AuthModalState;
  openAuthModal: (mode?: "entrar" | "cadastrar", message?: string) => void;
  closeAuthModal: () => void;

  // Usada antes de ações que exigem login
  requireLogin: (message?: string) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Lê a lista de usuários salva (ou usa a lista de exemplo)
function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

function loadSession(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

// Estado global de AUTENTICAÇÃO: quem está logado (ou ninguém = visitante), login, cadastro, sair, trocar senha e recuperar senha.
// Simulação com os usuários no localStorage do navegador.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(loadUsers);
  
  const [sessionEmail, setSessionEmail] = useState<string | null>(loadSession);
  const [authModal, setAuthModal] = useState<AuthModalState>(null);

  const user = users.find((u) => u.email === sessionEmail) ?? null;

  function saveUsers(next: User[]) {
    setUsers(next);
    localStorage.setItem(USERS_KEY, JSON.stringify(next));
  }

  function startSession(email: string) {
    setSessionEmail(email);
    localStorage.setItem(SESSION_KEY, email);
  }

  function login(email: string, password: string): AuthResult {
    const found = users.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, message: "Email ou senha incorretos." };

    startSession(found.email);
    return { ok: true, message: "Login realizado." };
  }

  function register(name: string, email: string, password: string): AuthResult {
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) return { ok: false, message: "Informe seu nome completo." };
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return { ok: false, message: "Informe um email válido." };
    }
    if (password.length < 6) {
      return { ok: false, message: "A senha precisa ter pelo menos 6 caracteres." };
    }
    if (users.some((u) => u.email === cleanEmail)) {
      return { ok: false, message: "Já existe uma conta com esse email." };
    }

    // Todo cadastro novo é "cliente"
    saveUsers([...users, { name: name.trim(), email: cleanEmail, password, role: "cliente" }]);
    startSession(cleanEmail);
    return { ok: true, message: "Conta criada." };
  }

  function logout() {
    setSessionEmail(null);
    localStorage.removeItem(SESSION_KEY);
  }

  function changePassword(currentPassword: string, newPassword: string): AuthResult {
    if (!user) return { ok: false, message: "Você precisa estar logado." };
    if (currentPassword !== user.password) {
      return { ok: false, message: "A senha atual está incorreta." };
    }
    if (newPassword.length < 6) {
      return { ok: false, message: "A nova senha precisa ter pelo menos 6 caracteres." };
    }

    saveUsers(users.map((u) => (u.email === user.email ? { ...u, password: newPassword } : u)));
    return { ok: true, message: "Senha alterada com sucesso!" };
  }

  // Simulação da criação do token guardado no navegador, com o site levando para a página de redefinição de senha
  function requestPasswordReset(email: string): AuthResult & { token?: string } {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return { ok: false, message: "Informe um email válido." };
    }
    
    if (!users.some((u) => u.email === cleanEmail)) {
      return { ok: false, message: "Não encontramos uma conta com esse email." };
    }

    const token = crypto.randomUUID();
  
    const stillValid = loadResets().filter((r) => r.expiresAt > Date.now() && r.email !== cleanEmail);
    saveResets([...stillValid, { token, email: cleanEmail, expiresAt: Date.now() + RESET_DURATION_MS }]);

    return { ok: true, message: "Link de recuperação enviado.", token };
  }

  function isResetTokenValid(token: string): boolean {
    return loadResets().some((r) => r.token === token && r.expiresAt > Date.now());
  }

  // Troca a senha de quem pediu a recuperação, com o link único
  function resetPassword(token: string, newPassword: string): AuthResult {
    const request = loadResets().find((r) => r.token === token && r.expiresAt > Date.now());
    if (!request) {
      return { ok: false, message: "Link inválido ou expirado. Peça um novo link." };
    }
    if (newPassword.length < 6) {
      return { ok: false, message: "A nova senha precisa ter pelo menos 6 caracteres." };
    }

    saveUsers(users.map((u) => (u.email === request.email ? { ...u, password: newPassword } : u)));
    saveResets(loadResets().filter((r) => r.token !== token)); 
    return { ok: true, message: "Senha redefinida com sucesso!" };
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