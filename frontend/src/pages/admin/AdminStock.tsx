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

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Categorias do catálogo da loja
const CATEGORY_OPTIONS = ["Top", "Shorts", "Macaquinho", "Cropped", "Leggings"];

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
  category: CATEGORY_OPTIONS[0],
  price: "",
  stock: "",
};

const CELL_INPUT_CLASS =
  "w-full border border-neutral-200 bg-white rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#8b1538]";

// Página de estoque que gerencia o inventário com busca de produtos, remoção e edição inline da quantidade em estoque
export default function AdminStock() {
  // Estoque global: o mesmo que é baixado quando um pagamento é confirmado em Vendas (agora vindo da API)
  const { stock, loading, error, reload, addStockItem, setStockQuantity, removeStockItem } = useOrders();
  const [search, setSearch] = useState("");

  // Edição do estoque de uma linha existente
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");

  // Linha nova
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
    setActionError("");
    setEditingSku(item.sku);
    setDraftValue(String(item.stock));
  }

  function cancelEditing() {
    setEditingSku(null);
    setDraftValue("");
  }

  async function saveEditing(sku: string) {
    const newStock = Number(draftValue);
    if (draftValue.trim() === "" || !Number.isInteger(newStock) || newStock < 0) {
      setActionError("Informe um estoque válido (número inteiro, 0 ou mais).");
      return;
    }

    setSaving(true);
    setActionError("");
    const result = await setStockQuantity(sku, newStock);
    setSaving(false);

    if (result.ok) cancelEditing();
    else setActionError(result.message ?? "Não foi possível salvar o estoque.");
  }

  async function removeItem(sku: string) {
    if (!window.confirm("Excluir esta variação do estoque? Esta ação não pode ser desfeita.")) return;

    setActionError("");
    setNotice("");
    const result = await removeStockItem(sku);
    if (result.ok) setNotice(result.message ?? "Variação excluída.");
    else setActionError(result.message ?? "Não foi possível excluir a variação.");
  }

  // Clicar em "Novo Produto" abre uma linha em branco no topo da tabela
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

    setNewItemError("");
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
    const product = newItem.product.trim();
    const price = Number(newItem.price.replace(",", "."));
    const quantity = Number(newItem.stock);
    const [color, size] = newItem.variation.split("/").map((part) => part.trim());

    // Validações
    if (!sku || !product) {
      setNewItemError("Preencha o SKU e o nome do produto.");
      return;
    }
    if (!color || !size) {
      setNewItemError('Informe a variação no formato "Cor / Tamanho" (ex.: Preto / M).');
      return;
    }

    // A cor precisa existir na paleta da loja (data/colors.ts), senão a bolinha de cor não aparece no site
    const validColors = [...new Set(Object.values(COLOR_NAMES))];
    const knownColor = validColors.find((c) => c.toLowerCase() === color.toLowerCase());
    if (!knownColor) {
      setNewItemError(`Cor desconhecida. Use uma destas: ${validColors.join(", ")}.`);
      return;
    }
    if (stock.some((item) => item.sku === sku)) {
      setNewItemError("Já existe um item com esse SKU.");
      return;
    }
    if (newItem.price === "" || Number.isNaN(price) || price <= 0) {
      setNewItemError("Informe um preço maior que zero.");
      return;
    }
    if (newItem.stock === "" || !Number.isInteger(quantity) || quantity < 0) {
      setNewItemError("Informe um estoque válido (número inteiro, 0 ou mais).");
      return;
    }

    const created: StockItem = {
      sku,
      product,
      variation: `${knownColor} / ${size}`,
      category: newItem.category,
      price,
      stock: quantity,
    };

    setSaving(true);
    setNewItemError("");
    const result = await addStockItem(created, newImage);
    setSaving(false);

    if (result.ok) cancelNewItem();
    else setNewItemError(result.message ?? "Não foi possível cadastrar o item.");
  }

  const filteredStock = stock.filter((item) =>
    matchesSearch(search, item.sku, item.product, item.variation, item.category)
  );

  return (
    <div>
      <AdminTopBar title="Estoque" />

      {error && (
        <div className="mb-5 flex items-center justify-between bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">
          <span>{error}</span>
          <button onClick={() => reload()} className="underline text-xs">
            Tentar novamente
          </button>
        </div>
      )}

      {actionError && <p className="mb-5 text-sm rounded-lg px-4 py-3 bg-red-50 text-red-700">{actionError}</p>}
      {notice && <p className="mb-5 text-sm rounded-lg px-4 py-3 bg-emerald-50 text-emerald-700">{notice}</p>}

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
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
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
                        disabled={saving}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Check size={12} />
                        {saving ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={cancelNewItem}
                        disabled={saving}
                        className="flex items-center gap-1 border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-60"
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
                          disabled={saving}
                          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Check size={12} />
                          {saving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={saving}
                          className="flex items-center gap-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-60"
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
                          onClick={() => item.productId && setEditingProductId(item.productId)}
                          disabled={!item.productId}
                          aria-label="Editar produto"
                          title="Editar produto (nome, preço, descrição e imagem)"
                          className="text-neutral-500 hover:text-[#8b1538] disabled:opacity-40"
                        >
                          <Package size={15} />
                        </button>
                        <button
                          onClick={() => removeItem(item.sku)}
                          aria-label="Excluir variação"
                          title="Excluir variação"
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

        {filteredStock.length === 0 && !newItem && (
          <p className="text-sm text-neutral-400 text-center py-8">
            {loading ? "Carregando..." : "Nenhum item encontrado."}
          </p>
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