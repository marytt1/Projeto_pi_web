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

// Página de carrinho de compras que permite gerenciar os itens, conferir os dados da conta e enviar o pedido diretamente via WhatsApp
export default function CartPage() {
  const { cart, cartNotice, canCheckout, changeQuantity, removeFromCart } = useShop();
  const { placeOrder } = useOrders();

  const { user, requireLogin } = useAuth();

  const [sentOrder, setSentOrder] = useState<{ id: string; whatsappLink: string } | null>(null);
  const [sending, setSending] = useState(false); // true enquanto o pedido é criado na API
  const [error, setError] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Só envia se há itens e todos têm estoque
  const canSubmit = cart.length > 0 && canCheckout && !sending;

  async function handleSendOrder() {
    if (!requireLogin("Faça login para enviar o pedido.") || !user) return;

    setError("");
    setSending(true);

    // Cópia do carrinho: depois do pedido ele é esvaziado
    const items = [...cart];
    const total = subtotal;

    try {
      // Cria o pedido (e todos os itens) na API e esvazia o carrinho
      const result = await placeOrder();

      if (!result.ok || !result.orderCode) {
        setError(result.message ?? "Não foi possível criar o pedido. Tente novamente.");
        return;
      }

      const itemsText = items
        .map(
          (item) =>
            `- ${item.name} (${item.size} / ${item.colorName}) x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
        )
        .join("\n");

      const lines = [
        `Olá! Gostaria de confirmar o pedido ${result.orderCode}:`,
        "",
        itemsText,
        "",
        `Subtotal: ${formatPrice(total)}`,
        "",
        `Nome: ${user.name}`,
        `Email: ${user.email}`,
      ];

      const whatsappLink = result.whatsappUrl ?? buildWhatsAppLink(lines.join("\n"));
      window.open(whatsappLink, "_blank");
      setSentOrder({ id: result.orderCode, whatsappLink });
    } finally {
      setSending(false);
    }
  }

  if (sentOrder) {
    return (
      <main className="px-6 md:px-10 py-16">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-8 text-center">
          <span className="mx-auto mb-4 w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Check size={28} />
          </span>
          <h1 className="font-serif text-2xl text-[#8b1538]">Pedido {sentOrder.id} registrado!</h1>
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

                      {item.status === "out_of_stock" && (
                        <p className="text-xs text-red-600 mt-1">Sem estoque. Remova este item para continuar.</p>
                      )}
                      {item.status === "quantity_adjusted" && (
                        <p className="text-xs text-amber-600 mt-1">Só restam {item.available} em estoque.</p>
                      )}

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
                          disabled={item.available !== undefined && item.quantity >= item.available}
                          className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
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

            {cartNotice && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3">{cartNotice}</p>
            )}

            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-2">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold text-lg">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 h-fit">
            <h2 className="font-medium text-lg mb-1">Identificação</h2>
            <p className="text-sm text-neutral-400 mb-6">
              O pedido é feito em nome da sua conta e o resumo é enviado para o WhatsApp da loja.
            </p>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={user?.name ?? ""}
                disabled
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none text-neutral-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={user?.email ?? ""}
                disabled
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none text-neutral-500"
              />
            </div>

            {error && <p className="text-xs text-red-600 text-center mt-4">{error}</p>}

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
              {sending ? "Enviando pedido..." : "Enviar Pedido via WhatsApp"}
            </button>

            {!canSubmit && !sending && (
              <p className="text-xs text-neutral-400 text-center mt-3">
                {cart.length === 0
                  ? "Adicione peças ao carrinho para continuar"
                  : "Ajuste os itens sem estoque para continuar"}
              </p>
            )}
          </div>
        </div>
      </main>

    </>
  );
}
