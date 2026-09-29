import { useState } from "react";
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { INITIAL_CART } from "../data/cart";
import type { CartItem } from "../types/cart";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Componente da Página de de carrinho de compras que permite gerenciar os itens, preencher os dados de identificação e enviar o pedido diretamente via WhatsApp
export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);

  // Dados do formulário de identificação, num único objeto de estado
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function changeQuantity(id: string, delta: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // O botão só fica habilitado quando nome e whatsapp estão preenchidos
  const canSubmit = form.name.trim() !== "" && form.whatsapp.trim() !== "" && cart.length > 0;

  // Monta a mensagem e abre o WhatsApp com o pedido já preenchido
  function handleSendOrder() {
    const itemsText = cart
      .map((item) => `- ${item.name} (${item.size}/${item.colorName}) x${item.quantity}`)
      .join("%0A");
    const message = `Olá! Meu nome é ${form.name}. Gostaria de fazer o seguinte pedido:%0A${itemsText}%0ASubtotal: ${formatPrice(subtotal)}`;
    window.open(`https://wa.me/?text=${message}`, "_blank");
  }

  return (
    <div className="font-sans text-[#3a3a3a]">
      <Header />

      <main className="px-6 md:px-10 py-10">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-medium text-lg mb-4">Itens</h2>

            {cart.length === 0 ? (
              <p className="text-sm text-neutral-400 py-10 text-center">
                Seu carrinho está vazio.
              </p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-neutral-400">
                        {item.size} · {item.colorName}
                      </p>
                      <p className="text-sm font-semibold text-[#8b1538] mt-1">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => changeQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-sm w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => changeQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label="Remover item"
                      className="text-neutral-300 hover:text-[#8b1538] self-start"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-2">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold text-lg">{formatPrice(subtotal)}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow p-6 h-fit">
            <h2 className="font-medium text-lg mb-1">Identificação</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Complete seus dados para finalizar a sua compra
            </p>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nome completo *"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8b1538]"
              />
              <input
                type="email"
                placeholder="Email (receba confirmação)"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8b1538]"
              />
              <input
                type="text"
                placeholder="WhatsApp * (ex: 19 99999-0000)"
                value={form.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8b1538]"
              />
            </div>

            <button
              onClick={handleSendOrder}
              disabled={!canSubmit}
              className={`w-full mt-6 flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-full transition-colors ${
                canSubmit
                  ? "bg-[#8b1538] hover:bg-[#71102d] text-white"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <MessageCircle size={16} />
              Enviar Pedido via WhatsApp
            </button>

            {!canSubmit && (
              <p className="text-xs text-neutral-400 text-center mt-3">
                Preencha nome e WhatsApp para continuar
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
