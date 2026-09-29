import { X, Heart } from "lucide-react";
import type { FavoriteItem } from "../types/favorite";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type FavoritesDrawerProps = {
  items: FavoriteItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
};

// Componente do Painel flutuante de favoritos que exibe os produtos salvos e permite removê-los da lista
export default function FavoritesDrawer({ items, onClose, onRemove }: FavoritesDrawerProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-xl border border-neutral-100 z-50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <h3 className="font-medium text-[#3a3a3a]">Meus Favoritos</h3>
        <button onClick={onClose} aria-label="Fechar" className="text-neutral-400 hover:text-[#3a3a3a]">
          <X size={18} />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">
            Você ainda não favoritou nenhuma peça.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-6 py-4">
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#3a3a3a] truncate">{item.name}</p>
                <p className="text-xs text-neutral-400">
                  {item.size} · {item.colorName}
                </p>
                <p className="text-sm font-semibold text-[#8b1538] mt-0.5">{formatPrice(item.price)}</p>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                aria-label="Remover dos favoritos"
                className="text-[#8b1538]"
              >
                <Heart size={18} className="fill-[#8b1538]" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
