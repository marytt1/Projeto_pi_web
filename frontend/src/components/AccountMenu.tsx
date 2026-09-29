import { X, ChevronRight, LogOut, UserCircle } from "lucide-react";

type AccountMenuProps = {
  userName: string;
  isAdmin?: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
};

// Componente Menu de conta do usuário com acesso condicional ao Painel Administrativo para admins
export default function AccountMenu({ userName, isAdmin = false, onClose, onOpenAdmin }: AccountMenuProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-xl border border-neutral-100 z-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-[#8b1538] text-white flex items-center justify-center">
            <UserCircle size={20} />
          </span>
          <p className="text-sm font-medium text-[#3a3a3a]">
            Seja bem vindo(a) {userName}
          </p>
        </div>
        <button onClick={onClose} aria-label="Fechar" className="text-neutral-400 hover:text-[#3a3a3a]">
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-col gap-2">
        <a
          href="#"
          className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-[#3a3a3a] hover:bg-neutral-50 transition-colors"
        >
          Configurações da Conta
          <ChevronRight size={16} className="text-neutral-300" />
        </a>

        
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium bg-[#8b1538] text-white hover:bg-[#71102d] transition-colors"
          >
            Painel Administrativo
            <ChevronRight size={16} />
          </button>
        )}

        <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[#8b1538] hover:bg-[#faf1f0] transition-colors">
          <LogOut size={16} />
          Sair
        </button>
      </nav>
    </div>
  );
}
