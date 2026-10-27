import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { X } from "lucide-react";
import { useAuth } from "../components/AuthContext";
import PasswordField from "../components/PasswordField";

// Página de redefinição de senha, funcionando apenas com um token válido (criado em "Esqueci minha senha" e que vale por 15 minutos)
export default function ResetPasswordPage() {
  const { isResetTokenValid, resetPassword } = useAuth();
  const navigate = useNavigate();

  // useSearchParams lê o "?token=..." da URL
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  // Confere o link uma vez, quando a página abre
  const [tokenValid] = useState(() => isResetTokenValid(token));

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false); // true depois de redefinir com sucesso

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("A confirmação não é igual à nova senha.");
      return;
    }

    const result = resetPassword(token, newPassword);
    if (result.ok) setDone(true);
    else setError(result.message);
  }

  return (
    <div className="min-h-[70vh] bg-[#f3e7e5]">
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-start justify-center pt-24 px-4 z-[60]"
        onClick={() => navigate("/")}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative"
        >
          <Link to="/" aria-label="Fechar" className="absolute top-5 right-5 text-neutral-400 hover:text-[#3a3a3a]">
            <X size={18} />
          </Link>

          <div className="text-center mb-6">
            <h2 className="font-serif italic text-3xl text-[#8b1538]">La Rose</h2>
            <p className="text-sm text-neutral-500 mt-1">Criar nova senha</p>
          </div>

          {!tokenValid && !done && (
            <div className="text-center">
              <p className="text-sm text-red-600 mb-5">
                Este link é inválido ou expirou. Peça um novo link de recuperação.
              </p>
              <Link
                to="/login"
                className="inline-block w-full bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-3 rounded-full"
              >
                Voltar para o login
              </Link>
            </div>
          )}

          {tokenValid && !done && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-xs text-neutral-500 text-center">
                Digite e confirme a sua nova senha (mínimo de 6 caracteres).
              </p>

              <PasswordField value={newPassword} onChange={setNewPassword} placeholder="Nova senha" />
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirmar nova senha"
              />

              {error && <p className="text-xs text-red-600 text-center">{error}</p>}

              <button
                type="submit"
                className="w-full bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-3 rounded-full"
              >
                Redefinir senha
              </button>
            </form>
          )}

          {done && (
            <div className="text-center">
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-3 mb-5">
                Senha redefinida com sucesso! Agora é só entrar com a nova senha.
              </p>
              <Link
                to="/login"
                className="inline-block w-full bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-3 rounded-full"
              >
                Ir para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}