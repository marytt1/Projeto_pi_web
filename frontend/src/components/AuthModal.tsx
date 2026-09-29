import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";


type AuthModalProps = {
  initialMode?: "entrar" | "cadastrar";
  onClose?: () => void;
};


// Componente do Modal de Autenticação alternando entre as abas de login e cadastro
export default function AuthModal({ initialMode = "entrar", onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"entrar" | "cadastrar">(initialMode);
  const [showPassword, setShowPassword] = useState(false);


  return (
    // Fundo escurecido cobrindo a tela toda
    <div
      className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-start justify-center pt-24 px-4 z-50"
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
          <p className="text-sm text-neutral-500 mt-1">
            {mode === "entrar" ? "Acesse sua conta" : "Crie sua conta"}
          </p>
        </div>


        <div className="flex border-b border-neutral-100 mb-6">
          <button
            onClick={() => setMode("entrar")}
            className={`flex-1 text-sm font-medium pb-3 border-b-2 transition-colors ${
              mode === "entrar"
                ? "border-[#8b1538] text-[#8b1538]"
                : "border-transparent text-neutral-400"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode("cadastrar")}
            className={`flex-1 text-sm font-medium pb-3 border-b-2 transition-colors ${
              mode === "cadastrar"
                ? "border-[#8b1538] text-[#8b1538]"
                : "border-transparent text-neutral-400"
            }`}
          >
            Cadastrar
          </button>
        </div>


        {mode === "entrar" ? (
          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8b1538]"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 pr-10 text-sm outline-none focus:border-[#8b1538]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                aria-label="Mostrar senha"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>


            <a href="#" className="text-xs text-[#8b1538] text-right -mt-2">
              Esqueci minha senha
            </a>


            <button
              type="submit"
              className="w-full bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-3 rounded-full"
            >
              Entrar
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nome completo"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8b1538]"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8b1538]"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Crie uma senha"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 pr-10 text-sm outline-none focus:border-[#8b1538]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                aria-label="Mostrar senha"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>


            <p className="text-xs text-neutral-400 -mt-2">
              Ao criar conta, você concorda com nossa política de privacidade.
            </p>


            <button
              type="submit"
              className="w-full bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-3 rounded-full"
            >
              Criar Conta Grátis
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
