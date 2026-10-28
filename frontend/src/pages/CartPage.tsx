import { useState } from "react";
import { Link } from "react-router";
import { Minus, Plus, Trash2, MessageCircle, Check } from "lucide-react";
import { useShop } from "../components/ShopContext";
import { useAuth } from "../components/AuthContext";
import { buildWhatsAppLink } from "../data/links";
import { useOrders } from "../components/OrdersContext";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Página de carrinho de compras que permite gerenciar os itens, preencher os dados de identificação e enviar o pedido diretamente via WhatsApp
export default function CartPage() {
  const { cart, changeQuantity, removeFromCart, clearCart } = useShop();
  const { placeOrder } = useOrders();

  const { user, requireLogin } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "" });

  const [sentOrder, setSentOrder] = useState<{ id: string; whatsappLink: string } | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const canSubmit = form.name.trim() !== "" && cart.length > 0;

  function handleSendOrder() {
    if (!requireLogin("Faça login para enviar o pedido.") || !user) return;

    const order = placeOrder(cart, form.name.trim(), user.email);

    const itemsText = cart
      .map(
        (item) =>
          `- ${item.name} (${item.size} / ${item.colorName}) x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
      )
      .join("\n");

    const lines = [
      `Olá! Gostaria de confirmar o pedido ${order.id}:`,
      "",
      itemsText,
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
      "",
      `Nome: ${form.name.trim()}`,
    ];
    if (form.email.trim()) lines.push(`Email: ${form.email.trim()}`);

    const whatsappLink = buildWhatsAppLink(lines.join("\n"));
    window.open(whatsappLink, "_blank");
    clearCart();
    setSentOrder({ id: order.id, whatsappLink });
  }

  if (sentOrder) {
    return (
      <main className="px-6 md:px-10 py-16">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-8 text-center">
          <span className="mx-auto mb-4 w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Check size={28} />
          </span>
          <h1 className="font-serif text-2xl text-[#8b1538]">Pedido registrado!</h1>
          <p className="text-sm text-neutral-500 mt-3">
            Enviamos o resumo para o WhatsApp da loja. Continue a conversa por lá para combinar o
            pagamento. Assim que a loja confirmar, o seu pedido segue para a separação.
          </p>

          <a
            href={sentOrder.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-5 text-xs text-[#8b1538] underline"
          >
            O WhatsApp não abriu? Clique aqui
          </a>

          <Link
            to="/catalogo"
            className="block mt-6 bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-3 rounded-full"
          >
            Continuar comprando
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
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
                      onClick={() => removeFromCart(item.id)}
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
              Informe seu nome. O pedido será enviado para o WhatsApp da loja.
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
                placeholder="Email (opcional)"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
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
                Preencha seu nome para continuar
              </p>
            )}
          </div>
        </div>
      </main>

    </>
  );
}
