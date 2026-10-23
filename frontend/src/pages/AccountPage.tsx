import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../components/AuthContext";

const INPUT_CLASS =
  "w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8b1538]";

// Página de Configurações da Conta
export default function AccountPage() {
  const { user, changePassword } = useAuth();

  const [showCurrent, setShowCurrent] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("A confirmação não é igual à nova senha.");
      return;
    }

    const result = changePassword(currentPassword, newPassword);
    if (result.ok) {
      setSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(result.message);
    }
  }

  return (
    <main className="px-6 md:px-10 py-12 max-w-2xl mx-auto">
      <h1 className="font-serif text-3xl text-[#8b1538] mb-8">Configurações da Conta</h1>

      <section className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="font-medium mb-4">Dados da conta</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-neutral-500 mb-1.5 block">Nome</label>
            <input value={user.name} disabled className={`${INPUT_CLASS} text-neutral-500`} />
          </div>

          <div>
            <label className="text-xs text-neutral-500 mb-1.5 block">Email</label>
            <input value={user.email} disabled className={`${INPUT_CLASS} text-neutral-500`} />
          </div>

          <div>
            <label className="text-xs text-neutral-500 mb-1.5 block">Senha atual</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={user.password}
                disabled
                className={`${INPUT_CLASS} pr-10 text-neutral-500`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                aria-label="Mostrar senha"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                {showCurrent ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-medium mb-4">Alterar senha</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Senha atual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={INPUT_CLASS}
          />
          <input
            type="password"
            placeholder="Nova senha (mínimo 6 caracteres)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={INPUT_CLASS}
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={INPUT_CLASS}
          />

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && (
            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{success}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-3 rounded-full"
          >
            Salvar nova senha
          </button>
        </form>
      </section>
    </main>
  );
}