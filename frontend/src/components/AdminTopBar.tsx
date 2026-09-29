import { Image } from "lucide-react";
import type { ReactNode } from "react";


type AdminTopBarProps = {
  title: string;
  children?: ReactNode;
};


// Formata a data de hoje por extenso
function formatToday() {
  const today = new Date();
  const formatted = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  // Deixa a primeira letra maiúscula (o toLocaleDateString devolve minúsculo)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}


// Componente que exibe o o cabeçalho do painel admin com o título da página, data atual formatada e atalho para a loja
export default function AdminTopBar({ title }: AdminTopBarProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#3a3a3a]">{title}</h2>
        <p className="text-sm text-neutral-400 mt-1">{formatToday()}</p>
      </div>
      <button className="flex items-center gap-2 bg-[#1c1c1c] hover:bg-black transition-colors text-white text-sm font-medium px-4 py-2.5 rounded-full">
        <Image size={15} />
        Ver Loja
      </button>
    </div>
  );
}


