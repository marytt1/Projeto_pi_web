import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import AdminTopBar from "./AdminTopBar";
import { useOrders } from "../../components/OrdersContext";
import type { StockItem, StockCategory } from "../../types/stock";
import { matchesSearch } from "../../components/Search";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Rascunho da linha "Novo Produto"
type NewItemDraft = {
  sku: string;
  product: string;
  variation: string;
  category: StockCategory;
  price: string;
  stock: string;
};

const EMPTY_DRAFT: NewItemDraft = {
  sku: "",
  product: "",
  variation: "",
  category: "Fitness",
  price: "",
  stock: "",
};

const CELL_INPUT_CLASS =
  "w-full border border-neutral-200 bg-white rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#8b1538]";

// Página de estoque que gerencia o inventário com busca de produtos, remoção e edição inline da quantidade em estoque
export default function AdminStock() {
  // Estoque global: o mesmo que é baixado quando um pagamento é confirmado em Vendas
  const { stock, addStockItem, setStockQuantity, removeStockItem } = useOrders();
  const [search, setSearch] = useState("");

  // Edição do estoque de uma linha existente 
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");

  // Linha nova
  const [newItem, setNewItem] = useState<NewItemDraft | null>(null);
  const [newItemError, setNewItemError] = useState("");

  function startEditing(item: StockItem) {
    setNewItem(null); 
    setEditingSku(item.sku);
    setDraftValue(String(item.stock));
  }

  function cancelEditing() {
    setEditingSku(null);
    setDraftValue("");
  }

  function saveEditing(sku: string) {
    const newStock = Number(draftValue);
    if (Number.isNaN(newStock) || newStock < 0) return;

    setStockQuantity(sku, newStock);
    cancelEditing();
  }

  function removeItem(sku: string) {
    removeStockItem(sku);
  }

  // Clicar em "Novo Produto" abre uma linha em branco no topo da tabela
  function startNewItem() {
    cancelEditing();
    setNewItem({ ...EMPTY_DRAFT });
    setNewItemError("");
  }

  function cancelNewItem() {
    setNewItem(null);
    setNewItemError("");
  }

  // Atualiza um campo do rascunho, mantendo os outros
  function updateDraft<K extends keyof NewItemDraft>(field: K, value: NewItemDraft[K]) {
    setNewItem((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function saveNewItem() {
    if (!newItem) return;

    const sku = newItem.sku.trim().toUpperCase();
    const product = newItem.product.trim();
    const price = Number(newItem.price.replace(",", "."));
    const quantity = Number(newItem.stock);

    // Validações
    if (!sku || !product) {
      setNewItemError("Preencha o SKU e o nome do produto.");
      return;
    }
    if (stock.some((item) => item.sku === sku)) {
      setNewItemError("Já existe um item com esse SKU.");
      return;
    }
    if (newItem.price === "" || Number.isNaN(price) || price < 0) {
      setNewItemError("Informe um preço válido.");
      return;
    }
    if (newItem.stock === "" || !Number.isInteger(quantity) || quantity < 0) {
      setNewItemError("Informe um estoque válido (número inteiro, 0 ou mais).");
      return;
    }

    const created: StockItem = {
      sku,
      product,
      variation: newItem.variation.trim(),
      category: newItem.category,
      price,
      stock: quantity,
    };
    addStockItem(created);
    cancelNewItem();
  }

  const filteredStock = stock.filter((item) =>
    matchesSearch(search, item.sku, item.product, item.variation, item.category)
  );

  return (
    <div>
      <AdminTopBar title="Estoque" />

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50">
          <h3 className="font-medium">Gestão de Estoque</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5 w-56">
              <Search size={14} className="text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar produto.."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm outline-none w-full placeholder:text-neutral-400"
              />
            </div>
            <button
              onClick={startNewItem}
              className="flex items-center gap-1.5 bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap"
            >
              <Plus size={14} />
              Novo Produto
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400 text-xs border-b border-neutral-100">
              <th className="px-6 py-3 font-normal">SKU</th>
              <th className="px-6 py-3 font-normal">Produto</th>
              <th className="px-6 py-3 font-normal">Variação</th>
              <th className="px-6 py-3 font-normal">Categoria</th>
              <th className="px-6 py-3 font-normal">Preço</th>
              <th className="px-6 py-3 font-normal">Estoque</th>
              <th className="px-6 py-3 font-normal">Ação</th>
            </tr>
          </thead>
          <tbody>
            {newItem && (
              <>
                <tr className="border-b border-neutral-100 bg-[#faf1f0]">
                  <td className="px-4 py-3">
                    <input
                      autoFocus
                      value={newItem.sku}
                      onChange={(e) => updateDraft("sku", e.target.value)}
                      placeholder="P07-BRD-M"
                      className={CELL_INPUT_CLASS}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={newItem.product}
                      onChange={(e) => updateDraft("product", e.target.value)}
                      placeholder="Nome do produto"
                      className={CELL_INPUT_CLASS}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={newItem.variation}
                      onChange={(e) => updateDraft("variation", e.target.value)}
                      placeholder="Cor / Tamanho"
                      className={CELL_INPUT_CLASS}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={newItem.category}
                      onChange={(e) => updateDraft("category", e.target.value as StockCategory)}
                      className={CELL_INPUT_CLASS}
                    >
                      <option value="Lingerie">Lingerie</option>
                      <option value="Fitness">Fitness</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => updateDraft("price", e.target.value)}
                      placeholder="0,00"
                      className={CELL_INPUT_CLASS}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      value={newItem.stock}
                      onChange={(e) => updateDraft("stock", e.target.value)}
                      placeholder="0"
                      className={CELL_INPUT_CLASS}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveNewItem}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-full"
                      >
                        <Check size={12} />
                        Salvar
                      </button>
                      <button
                        onClick={cancelNewItem}
                        className="flex items-center gap-1 border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors text-xs font-medium px-3 py-1.5 rounded-full"
                      >
                        <X size={12} />
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>

                {newItemError && (
                  <tr className="bg-[#faf1f0]">
                    <td colSpan={7} className="px-6 pb-3 text-xs text-red-600">
                      {newItemError}
                    </td>
                  </tr>
                )}
              </>
            )}

            {filteredStock.map((item) => {
              const isEditing = editingSku === item.sku;

              return (
                <tr key={item.sku} className="border-b border-neutral-50 last:border-0">
                  <td className="px-6 py-4 text-neutral-400">{item.sku}</td>
                  <td className="px-6 py-4 font-medium">{item.product}</td>
                  <td className="px-6 py-4 text-neutral-500">{item.variation}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatPrice(item.price)}</td>

                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        className="w-16 border border-neutral-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#8b1538]"
                        autoFocus
                      />
                    ) : item.stock === 0 ? (
                      <span className="flex items-center gap-2">
                        <span className="text-red-500 font-medium">0</span>
                        <span className="text-[10px] bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded-full">
                          ESGOTADO
                        </span>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">{item.stock}</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEditing(item.sku)}
                          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-full"
                        >
                          <Check size={12} />
                          Salvar
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center gap-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors text-xs font-medium px-3 py-1.5 rounded-full"
                        >
                          <X size={12} />
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEditing(item)}
                          aria-label="Editar"
                          className="text-[#8b1538] hover:text-[#71102d]"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => removeItem(item.sku)}
                          aria-label="Excluir"
                          className="text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
