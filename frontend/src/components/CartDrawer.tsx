import { X, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "../types/cart";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type CartDrawerProps = {
  items: CartItem[];
  onClose: () => void;
  onChangeQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout?: () => void;
  onClear?: () => void; 
};

// Componente do Painel flutuante do carrinho de compras que lista os itens, permite alterar quantidades e calcula o subtotal
export default function CartDrawer({ items, onClose, onChangeQuantity, onRemove, onCheckout, onClear }: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-xl border border-neutral-100 z-50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <div>
          <h3 className="font-medium text-[#3a3a3a]">Meu Carrinho</h3>
          <p className="text-xs text-neutral-400">{items.length} item{items.length !== 1 && "s"}</p>
        </div>
        <button onClick={onClose} aria-label="Fechar" className="text-neutral-400 hover:text-[#3a3a3a]">
          <X size={18} />
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-neutral-50">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">Seu carrinho está vazio.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-3 px-6 py-4">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              ) : (
                <span className="w-14 h-14 rounded-lg bg-neutral-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#3a3a3a] truncate">{item.name}</p>
                <p className="text-xs text-neutral-400">
                  {item.size} · {item.colorName}
                </p>
                <p className="text-sm font-semibold text-[#8b1538] mt-0.5">{formatPrice(item.price)}</p>

                {item.status === "out_of_stock" && (
                  <p className="text-xs text-red-600 mt-0.5">Sem estoque. Remova este item.</p>
                )}
                {item.status === "quantity_adjusted" && (
                  <p className="text-xs text-amber-600 mt-0.5">Só restam {item.available} em estoque.</p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onChangeQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onChangeQuantity(item.id, 1)}
                    disabled={item.available !== undefined && item.quantity >= item.available}
                    className="w-6 h-6 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                aria-label="Remover item"
                className="text-neutral-300 hover:text-[#8b1538] self-start"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="px-6 py-4 border-t border-neutral-100">
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-neutral-500">Subtotal</span>
          <span className="font-semibold text-[#3a3a3a]">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="flex-1 bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finalizar
          </button>
          <button
            onClick={() => {
              onClear?.();
              onClose();
            }}
            className="flex-1 border border-[#8b1538] text-[#8b1538] hover:bg-[#faf1f0] transition-colors text-sm font-medium py-2.5 rounded-full"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}