import { useState } from "react";
import type { FormEvent } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./AuthContext";

type AuthView = "entrar" | "cadastrar" | "recuperar";

type AuthModalProps = {
  initialMode?: "entrar" | "cadastrar";
  message?: string;
  onClose?: () => void;
};

const INPUT_CLASS =
  "w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8b1538]";
const PRIMARY_BUTTON_CLASS =
  "w-full bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-3 rounded-full";

// Campo de senha com o botão de mostrar/esconder (usado no login e no cadastro)
type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function PasswordField({ value, onChange, placeholder }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
        aria-label="Mostrar senha"
      >
        {show ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    </div>
  );
}

// Componente do Modal de Autenticação alternando entre as abas de login e cadastro
export default function AuthModal({ initialMode = "entrar", message, onClose }: AuthModalProps) {
  const { login, register, requestPasswordReset } = useAuth();

  const [view, setView] = useState<AuthView>(initialMode);

  // Campos do formulário e mensagens
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Troca de tela limpando mensagens antigas
  function changeView(next: AuthView) {
    setView(next);
    setError("");
    setSuccess("");
  }

  function handleLogin(event: FormEvent) {
    event.preventDefault();
    const result = login(email, password);
    if (result.ok) onClose?.();
    else setError(result.message);
  }

  function handleRegister(event: FormEvent) {
    event.preventDefault();
    const result = register(name, email, password);
    if (result.ok) onClose?.();
    else setError(result.message);
  }

  function handleRecover(event: FormEvent) {
    event.preventDefault();
    const result = requestPasswordReset(email);
    if (result.ok) {
      setError("");
      setSuccess(result.message);
    } else {
      setSuccess("");
      setError(result.message);
    }
  }

  const subtitle =
    view === "entrar" ? "Acesse sua conta" : view === "cadastrar" ? "Crie sua conta" : "Recuperar senha";

  return (
    // Fundo escurecido: clicar fora fecha o modal
    <div
      className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-start justify-center pt-24 px-4 z-[60]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative"
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-5 right-5 text-neutral-400 hover:text-[#3a3a3a]"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <h2 className="font-serif italic text-3xl text-[#8b1538]">La Rose</h2>
          <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
        </div>

        {message && (
          <p className="text-xs text-center text-[#8b1538] bg-[#faf1f0] rounded-lg px-3 py-2 mb-4">
            {message}
          </p>
        )}

        {view !== "recuperar" && (
          <div className="flex border-b border-neutral-100 mb-6">
            {(["entrar", "cadastrar"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => changeView(tab)}
                className={`flex-1 text-sm font-medium pb-3 border-b-2 transition-colors ${
                  view === tab ? "border-[#8b1538] text-[#8b1538]" : "border-transparent text-neutral-400"
                }`}
              >
                {tab === "entrar" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>
        )}

        {view === "entrar" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
            <PasswordField value={password} onChange={setPassword} placeholder="Senha" />

            {/* Abre a tela de recuperação de senha */}
            <button
              type="button"
              onClick={() => changeView("recuperar")}
              className="text-xs text-[#8b1538] text-right -mt-2"
            >
              Esqueci minha senha
            </button>

            {error && <p className="text-xs text-red-600 text-center">{error}</p>}

            <button type="submit" className={PRIMARY_BUTTON_CLASS}>
              Entrar
            </button>
          </form>
        )}

        {view === "cadastrar" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_CLASS}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
            <PasswordField value={password} onChange={setPassword} placeholder="Crie uma senha" />

            <p className="text-xs text-neutral-400 -mt-2">
              Ao criar conta, você concorda com nossa política de privacidade.
            </p>

            {error && <p className="text-xs text-red-600 text-center">{error}</p>}

            <button type="submit" className={PRIMARY_BUTTON_CLASS}>
              Criar Conta Grátis
            </button>
          </form>
        )}

        {view === "recuperar" && (
          <form onSubmit={handleRecover} className="flex flex-col gap-4">
            <p className="text-xs text-neutral-500 text-center">
              Digite o email da sua conta e enviaremos um link para você criar uma nova senha.
            </p>
            <input
              type="email"
              placeholder="Email da sua conta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />

            {error && <p className="text-xs text-red-600 text-center">{error}</p>}
            {success && (
              <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 text-center">
                {success}
              </p>
            )}

            <button type="submit" className={PRIMARY_BUTTON_CLASS}>
              Enviar link de recuperação
            </button>
            <button
              type="button"
              onClick={() => changeView("entrar")}
              className="text-xs text-[#8b1538]"
            >
              ← Voltar para o login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}