import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
import { INITIAL_USERS } from "../data/users";

// ---------------------------------------------------------------------
// Estado global de AUTENTICAÇÃO: quem está logado (ou ninguém = visitante),
// login, cadastro, sair, trocar senha e recuperar senha.
//
// ATENÇÃO: isto é uma SIMULAÇÃO de front-end. Os usuários ficam no
// localStorage do navegador e a senha é guardada como texto. Num sistema
// real isso é feito pela API/back-end (senha criptografada, token/sessão).
// ---------------------------------------------------------------------

const USERS_KEY = "larose_users";
const SESSION_KEY = "larose_session";

// Resultado padrão das ações: deu certo ou não + mensagem pra mostrar na tela
export type AuthResult = { ok: boolean; message: string };

// Estado do modal de login: null = fechado
type AuthModalState = { mode: "entrar" | "cadastrar"; message?: string } | null;

type AuthContextType = {
  user: User | null; // null = visitante
  isAdmin: boolean;
  login: (email: string, password: string) => AuthResult;
  register: (name: string, email: string, password: string) => AuthResult;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => AuthResult;
  requestPasswordReset: (email: string) => AuthResult;
  // modal de login (aberto de qualquer lugar do site)
  authModal: AuthModalState;
  openAuthModal: (mode?: "entrar" | "cadastrar", message?: string) => void;
  closeAuthModal: () => void;
  // Usada antes de ações que exigem login. Se for visitante, abre o modal
  // de login e devolve false (a ação NÃO deve continuar).
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(loadUsers);
  // Guardamos só o EMAIL de quem está logado; o usuário completo é
  // procurado na lista (assim, trocar a senha atualiza tudo sozinho).
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

    // Todo cadastro novo é "cliente". Só o admin de exemplo tem o perfil admin.
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

  // SIMULADO: um front-end não consegue enviar email. Num sistema real, aqui
  // vai a chamada à API (ex: POST /auth/esqueci-senha) e o servidor manda o
  // email com o link. A mensagem é a mesma exista o email ou não, pra não
  // revelar quais emails têm conta.
  function requestPasswordReset(email: string): AuthResult {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return { ok: false, message: "Informe um email válido." };
    }
    return {
      ok: true,
      message: `Se ${cleanEmail} tiver cadastro, enviamos um link para redefinir a senha.`,
    };
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

// Hook: const { user, isAdmin, login } = useAuth();
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  }
  return context;
}