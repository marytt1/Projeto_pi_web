import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Search, Plus, Pencil, Trash2, Check, X, Package, ImagePlus } from "lucide-react";
import AdminTopBar from "./AdminTopBar";
import { useOrders } from "../../components/OrdersContext";
import type { StockItem, StockCategory } from "../../types/stock";
import { matchesSearch } from "../../components/Search";
import ProductEditModal from "../../components/ProductEditModal";
import { makePreview, revokePreview, validateImageFile } from "../../services/imageFile";
import { COLOR_NAMES } from "../../data/colors";
import { useShop } from "../../components/ShopContext";
import { normalizeText } from "../../components/Search";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Categorias do catálogo da loja
const CATEGORY_OPTIONS = ["Top", "Shorts", "Macaquinho", "Cropped", "Leggings"];

// Rascunho da linha "Novo Produto"
type NewItemDraft = {
  sku: string;
  product: string;
  variation: string; // "Cor / Tamanho"
  category: StockCategory;
  price: string;
  stock: string;
};

const EMPTY_DRAFT: NewItemDraft = {
  sku: "",
  product: "",
  variation: "",
  category: "Top",
  price: "",
  stock: "",
};

const CELL_INPUT_CLASS =
  "w-full border border-neutral-200 bg-white rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#8b1538]";

// Página de estoque que gerencia o inventário com busca de produtos, remoção e edição inline da quantidade em estoque
export default function AdminStock() {
  const { products } = useShop();
  const { stock, loading, error, reload, addStockItem, setStockQuantity, removeStockItem } = useOrders();
  const [search, setSearch] = useState("");

  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState("");

  const [newItem, setNewItem] = useState<NewItemDraft | null>(null);
  const [newItemError, setNewItemError] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null); // imagem do produto novo
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  // Produto aberto na janela "Editar produto" (preço, descrição e imagem)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false); // true enquanto a API responde
  const [actionError, setActionError] = useState(""); // erro de editar ou excluir
  const [notice, setNotice] = useState(""); // aviso de sucesso ao excluir

  // Ao abrir a tela, busca o estoque mais recente na API
  useEffect(() => {
    reload();
  }, [reload]);

  function startEditing(item: StockItem) {
    setNewItem(null);
    setRowError("");
    setEditingSku(item.sku);
    setDraftValue(String(item.stock));
  }

  function cancelEditing() {
    setEditingSku(null);
    setDraftValue("");
    setRowError("");
  }

  async function saveEditing(item: StockItem) {
    const value = Number(draftValue);
    if (draftValue === "" || !Number.isInteger(value) || value < 0) {
      setRowError("O estoque deve ser um número inteiro maior ou igual a zero.");
      return;
    }
    setBusy(true);
    const result = await setStockQuantity(item.sku, value);
    setBusy(false);
    if (result.ok) cancelEditing();
    else setRowError(result.message ?? "Não foi possível salvar o estoque.");
  }

  async function removeItem(item: StockItem) {
    if (!window.confirm(`Excluir a variação ${item.sku}? Essa ação não pode ser desfeita.`)) return;
    setRowError("");
    setBusy(true);
    const result = await removeStockItem(item.sku);
    setBusy(false);
    if (!result.ok) setRowError(result.message ?? "Não foi possível excluir.");
  }

  function startNewItem() {
    cancelEditing();
    setActionError("");
    setNewItem({ ...EMPTY_DRAFT });
    setNewItemError("");
  }

  function cancelNewItem() {
    revokePreview(newImagePreview);
    setNewImage(null);
    setNewImagePreview(null);
    setNewItem(null);
    setNewItemError("");
  }

  // Imagem escolhida na linha "Novo Produto"
  function handleNewImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    revokePreview(newImagePreview);

    if (!file) {
      setNewImage(null);
      setNewImagePreview(null);
      return;
    }

    const problem = validateImageFile(file);
    if (problem) {
      setNewItemError(problem);
      event.target.value = "";
      setNewImage(null);
      setNewImagePreview(null);
      return;
    }

    setNewIStemError("");
    setNewImage(file);
    setNewImagePreview(makePreview(file));
  }

  // Atualiza um campo do rascunho, mantendo os outros
  function updateDraft<K extends keyof NewItemDraft>(field: K, value: NewItemDraft[K]) {
    setNewItem((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function saveNewItem() {
    if (!newItem) return;

    const sku = newItem.sku.trim().toUpperCase();
    const quantity = Number(newItem.stock);
    const [color, size] = newItem.variation.split("/").map((part) => part.trim());

    // O produto precisa existir (cadastrado na tela Produtos)
    const product = products.find((p) => normalizeText(p.name) === normalizeText(newItem.product));

    if (!sku) {
      setNewItemError("Informe o SKU.");
      return;
    }
    if (!product) {
      setNewItemError("Produto não encontrado. Cadastre-o primeiro na tela Produtos.");
      return;
    }
    if (!/^[^/]+\/[^/]+$/.test(newItem.variation.trim())) {
      setNewItemError('Informe a variação no formato "Cor / Tamanho" (ex.: Preto / M).');
      return;
    }
    if (stock.some((item) => item.sku === sku)) {
      setNewItemError("Já existe um item com esse SKU.");
      return;
    }
    if (newItem.stock === "" || !Number.isInteger(quantity) || quantity < 0) {
      setNewItemError("Informe um estoque válido (número inteiro, 0 ou mais).");
      return;
    }

    const created: StockItem = {
      sku,
      productId: product.id,
      product: product.name,
      variation: newItem.variation.trim(),
      category: product.category,
      price: product.price,
      stock: quantity,
    };

    setBusy(true);
    const result = await addStockItem(created);
    setBusy(false);

    if (result.ok) cancelNewItem();
    else setNewItemError(result.message ?? "Não foi possível cadastrar.");
  }


  const filteredStock = stock.filter((item) =>
    matchesSearch(search, item.sku, item.product, item.variation, item.category)
  );

  return (
    <div>
      <AdminTopBar title="Estoque" />

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => reload()} className="underline">Tentar novamente</button>
        </div>
      )}
      {rowError && (
        <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{rowError}</p>
      )}

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
              Nova Variação
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
                      list="product-names"
                      value={newItem.product}
                      onChange={(e) => updateDraft("product", e.target.value)}
                      placeholder="Escolha o produto"
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
                  <td colSpan={2} className="px-4 py-3 text-xs text-neutral-400">Herdados do produto</td>
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
                  <td colSpan={2} className="px-4 py-3 text-xs text-neutral-400">Herdados do produto</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveNewItem}
                        disabled={busy}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-60"
                      >
                        <Check size={12} />
                        {busy ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={cancelNewItem}
                        disabled={busy}
                        className="flex items-center gap-1 border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors text-xs font-medium px-3 py-1.5 rounded-full"
                      >
                        <X size={12} />
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="bg-[#faf1f0]">
                  <td colSpan={7} className="px-4 pb-3">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-neutral-600">
                        <ImagePlus size={15} className="text-[#8b1538]" />
                        Imagem do produto (opcional)
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleNewImage}
                          className="text-xs"
                        />
                      </label>
                      {newImagePreview && (
                        <img src={newImagePreview} alt="Prévia da imagem" className="w-12 h-12 rounded-lg object-cover" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Só é usada quando o produto é novo. Para trocar a imagem de um produto que já existe, use o botão
                      “Editar produto” na linha dele.
                    </p>
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
                        min="0"
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
                      <span className={`font-medium ${item.stock <= 3 ? "text-amber-600" : "text-emerald-600"}`}>
                        {item.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEditing(item)}
                          disabled={busy}
                          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-60"
                        >
                          <Check size={12} />
                          {busy ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={busy}
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
                          aria-label="Editar estoque"
                          title="Editar estoque"
                          className="text-[#8b1538] hover:text-[#71102d]"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => removeItem(item)}
                          disabled={busy}
                          aria-label="Excluir"
                          className="text-neutral-400 hover:text-red-500 disabled:opacity-50"
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
        <datalist id="product-names">
          {products.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>

        {loading && stock.length === 0 && (
          <p className="text-sm text-neutral-500 text-center py-8">Carregando estoque...</p>
        )}
        {!loading && filteredStock.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">Nenhum item encontrado.</p>
        )}
      </div>

      {editingProductId && (
        <ProductEditModal
          productId={editingProductId}
          onClose={() => setEditingProductId(null)}
          onSaved={(message) => setNotice(message)}
        />
      )}
    </div>
  );
}