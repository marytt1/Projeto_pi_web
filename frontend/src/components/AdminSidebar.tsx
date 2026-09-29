import { LayoutGrid, CreditCard, Archive, LogOut, UserCircle } from "lucide-react";


export type AdminPage = "dashboard" | "vendas" | "estoque";


type AdminSidebarProps = {
  active: AdminPage;
  onNavigate: (page: AdminPage) => void;
};


const MENU_ITEMS: { page: AdminPage; label: string; icon: typeof LayoutGrid }[] = [
  { page: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { page: "vendas", label: "Vendas", icon: CreditCard },
  { page: "estoque", label: "Estoque", icon: Archive },
];


// Componente da Barra lateral de navegação do painel admin com destaque visual para a aba selecionada
export default function AdminSidebar({ active, onNavigate }: AdminSidebarProps) {
  return (
    <aside className="w-64 shrink-0 bg-[#faf1ee] min-h-screen flex flex-col px-6 py-8">
      <div className="flex items-center gap-3 mb-10">
        <span className="w-10 h-10 rounded-full bg-[#8b1538] text-white flex items-center justify-center">
          <UserCircle size={20} />
        </span>
        <h1 className="font-serif italic text-lg text-[#8b1538]">La Rose Admin</h1>
      </div>


      <nav className="flex flex-col gap-1">
        {MENU_ITEMS.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
              active === page
                ? "bg-[#8b1538] text-white"
                : "text-[#3a3a3a] hover:bg-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>


      <button className="mt-auto flex items-center gap-2 text-sm text-[#8b1538] px-4 py-3">
        <LogOut size={16} />
        Sair
      </button>
    </aside>
  );
}
