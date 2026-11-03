import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Plus, Pencil, Trash2, Search, X, ImageIcon } from "lucide-react";
import AdminTopBar from "./AdminTopBar";
import { useOrders } from "../../components/OrdersContext";
import { useShop } from "../../components/ShopContext";
import { matchesSearch } from "../../components/Search";
import type { Product, ProductCategory } from "../../types/product";

const DEFAULT_CATEGORIES = ["Top", "Shorts", "Macaquinho", "Cropped"];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_IMAGES = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const INPUT_CLASS =
  "w-full border border-neutral-200 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#8b1538]";

type Form = {
  name: string;
  description: string;
  price: string;
  oldPrice: string;
  category: ProductCategory;
};

// Foto escolhida e ainda não enviada (a prévia é um endereço temporário do navegador)
type PendingPhoto = { id: string; file: File; color: string | null; preview: string };

const EMPTY_FORM: Form = { name: "", description: "", price: "", oldPrice: "", category: "Top" };

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Catálogo no painel admin: cadastro, edição (com várias fotos, por cor) e exclusão de produtos
export default function AdminProducts() {
  const { products, loadingProducts, productsError, reloadProducts } = useShop();
  const { createProduct, updateProduct, deleteProduct, removeProductImage } = useOrders();

  // Sugestões do campo categoria: as padrão + as que já existem nos produtos
  const categories = [...new Set([...DEFAULT_CATEGORIES, ...products.map((p) => p.category)])].sort();
  // Sugestões do campo cor da foto: todas as cores já cadastradas nas variações
  const colorSuggestions = [
    ...new Set(products.flatMap((p) => (p.colorOptions ?? []).map((c) => c.name))),
  ].sort();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [photoColor, setPhotoColor] = useState(""); // cor do próximo lote de fotos ("" = foto geral)
  const [removingImageId, setRemovingImageId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [listMessage, setListMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // Produto sendo editado, sempre na versão mais recente da lista (para refletir fotos removidas)
  const liveEditing = editing && editing !== "new" ? products.find((p) => p.id === editing.id) ?? editing : null;
  const savedImages = liveEditing?.images ?? [];

  // Libera as prévias temporárias quando a tela é fechada
  const pendingRef = useRef<PendingPhoto[]>([]);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);
  useEffect(() => {
    return () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview));
  }, []);

  function clearPending() {
    pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview));
    setPending([]);
  }

  function openNew() {
    clearPending();
    setEditing("new");
    setForm(EMPTY_FORM);
    setPhotoColor("");
    setFormError("");
    setListMessage(null);
  }

  function openEdit(product: Product) {
    clearPending();
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      category: product.category,
    });
    setPhotoColor("");
    setFormError("");
    setListMessage(null);
  }

  function closeForm() {
    clearPending();
    setEditing(null);
    setFormError("");
  }

  function updateField<K extends keyof Form>(field: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = ""; // permite escolher o mesmo arquivo de novo
    setFormError("");
    if (picked.length === 0) return;

    if (savedImages.length + pending.length + picked.length > MAX_IMAGES) {
      setFormError(`Cada produto aceita no máximo ${MAX_IMAGES} fotos.`);
      return;
    }
    for (const file of picked) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFormError(`"${file.name}" não é JPG, PNG ou WEBP.`);
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setFormError(`"${file.name}" passa de 3 MB.`);
        return;
      }
    }

    const color = photoColor.trim() || null;
    setPending((prev) => [
      ...prev,
      ...picked.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        color,
        preview: URL.createObjectURL(file),
      })),
    ]);
  }

  function removePending(id: string) {
    setPending((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleRemoveSaved(imageId: string) {
    if (!liveEditing) return;
    if (!window.confirm("Remover esta foto do produto?")) return;
    setFormError("");
    setRemovingImageId(imageId);
    const result = await removeProductImage(liveEditing.id, imageId);
    setRemovingImageId(null);
    if (!result.ok) setFormError(result.message ?? "Não foi possível remover a foto.");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setFormError("");

    const name = form.name.trim();
    const price = Number(form.price.replace(",", "."));
    const oldPrice = form.oldPrice.trim() === "" ? null : Number(form.oldPrice.replace(",", "."));

    if (!name) {
      setFormError("Informe o nome do produto.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Informe um preço maior que zero.");
      return;
    }
    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= price)) {
      setFormError("O preço antigo (promoção) deve ser maior que o preço atual. Deixe vazio se não há promoção.");
      return;
    }
    if (!form.category.trim()) {
      setFormError("Informe a categoria.");
      return;
    }

    const data = { name, description: form.description.trim(), price, oldPrice, category: form.category.trim() };
    const images = pending.map(({ file, color }) => ({ file, color }));

    setSaving(true);
    const result =
      editing === "new" ? await createProduct(data, images) : await updateProduct(editing.id, data, images);
    setSaving(false);

    if (result.ok) {
      setListMessage({ type: "ok", text: editing === "new" ? "Produto cadastrado!" : "Produto atualizado!" });
      closeForm();
    } else {
      setFormError(result.message ?? "Não foi possível salvar o produto.");
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Excluir "${product.name}"? As variações (estoque), as fotos e os favoritos desse produto também serão apagados.`)) {
      return;
    }
    setListMessage(null);
    const result = await deleteProduct(product.id);
    setListMessage(
      result.ok
        ? { type: "ok", text: "Produto excluído." }
        : { type: "error", text: result.message ?? "Não foi possível excluir." }
    );
  }

  const filtered = products.filter((p) => matchesSearch(search, p.name, p.category));

  return (
    <div>
      <AdminTopBar title="Produtos" />

      {productsError && (
        <div className="mb-5 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{productsError}</span>
          <button onClick={() => reloadProducts()} className="underline">Tentar novamente</button>
        </div>
      )}
      {listMessage && (
        <p
          className={`mb-5 rounded-lg px-4 py-3 text-sm ${
            listMessage.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {listMessage.text}
        </p>
      )}

      {editing && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-medium">{editing === "new" ? "Novo produto" : `Editar: ${editing.name}`}</h3>
            <button type="button" onClick={closeForm} aria-label="Fechar" className="text-neutral-400 hover:text-[#3a3a3a]">
              <X size={18} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="p-name" className="text-xs text-neutral-500 mb-1.5 block">Nome</label>
              <input id="p-name" value={form.name} onChange={(e) => updateField("name", e.target.value)} className={INPUT_CLASS} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-desc" className="text-xs text-neutral-500 mb-1.5 block">Descrição</label>
              <textarea
                id="p-desc"
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="p-cat" className="text-xs text-neutral-500 mb-1.5 block">Categoria</label>
              <input
                id="p-cat"
                list="category-names"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder="Escolha ou digite uma nova"
                className={INPUT_CLASS}
              />
              <datalist id="category-names">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="p-price" className="text-xs text-neutral-500 mb-1.5 block">Preço (R$)</label>
                <input
                  id="p-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="p-old" className="text-xs text-neutral-500 mb-1.5 block">Preço antigo</label>
                <input
                  id="p-old"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="opcional"
                  value={form.oldPrice}
                  onChange={(e) => updateField("oldPrice", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          {/* Fotos */}
          <div className="mt-6 border-t border-neutral-100 pt-5">
            <div className="flex items-baseline justify-between mb-3">
              <h4 className="text-sm font-medium">Fotos do produto</h4>
              <span className="text-[11px] text-neutral-400">
                {savedImages.length + pending.length}/{MAX_IMAGES} · a primeira foto é a capa
              </span>
            </div>

            {savedImages.length + pending.length === 0 ? (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-6 text-sm text-neutral-400">
                <ImageIcon size={18} />
                Nenhuma foto ainda.
              </div>
            ) : (
              <div className="mb-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
                {savedImages.map((image) => (
                  <div key={image.id} className="relative">
                    <img src={image.url} alt="" className="aspect-[3/4] w-full rounded-lg object-cover bg-neutral-100" />
                    <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                      {image.colorName ?? "Todas as cores"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSaved(image.id)}
                      disabled={removingImageId === image.id}
                      aria-label="Remover foto"
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-neutral-500 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {pending.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img src={photo.preview} alt="" className="aspect-[3/4] w-full rounded-lg object-cover bg-neutral-100 ring-2 ring-[#8b1538]/40" />
                    <span className="absolute bottom-1 left-1 rounded-full bg-[#8b1538]/90 px-2 py-0.5 text-[10px] text-white">
                      Nova · {photo.color ?? "Todas as cores"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePending(photo.id)}
                      aria-label="Descartar foto"
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-neutral-500 hover:text-red-500"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <label htmlFor="photo-color" className="text-xs text-neutral-500 mb-1.5 block">
                  Cor das próximas fotos (deixe vazio para foto geral)
                </label>
                <input
                  id="photo-color"
                  list="photo-colors"
                  value={photoColor}
                  onChange={(e) => setPhotoColor(e.target.value)}
                  placeholder="Ex.: Preto (igual ao nome da cor da variação)"
                  className={INPUT_CLASS}
                />
                <datalist id="photo-colors">
                  {colorSuggestions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <label className="shrink-0 text-center text-xs text-[#8b1538] border border-[#8b1538] rounded-full px-5 py-2.5 cursor-pointer hover:bg-[#faf1f0] transition-colors">
                Adicionar fotos
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFiles}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              JPG, PNG ou WEBP até 3 MB cada. Dá para escolher várias de uma vez; as fotos só são enviadas ao salvar.
              Para fotos de outra cor, troque o campo acima e adicione de novo.
            </p>
          </div>

          {formError && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700">{formError}</p>}

          <div className="flex items-center gap-3 mt-5">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium px-6 py-2.5 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : "Salvar produto"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors text-sm font-medium px-6 py-2.5 rounded-full"
            >
              Cancelar
            </button>
          </div>
          {editing === "new" && (
            <p className="text-xs text-neutral-400 mt-3">
              Depois de salvar, cadastre as cores e tamanhos na tela de Estoque (Nova Variação).
            </p>
          )}
        </form>
      )}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50">
          <h3 className="font-medium">Catálogo de Produtos</h3>
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
              onClick={openNew}
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
              <th className="px-6 py-3 font-normal">Foto</th>
              <th className="px-6 py-3 font-normal">Produto</th>
              <th className="px-6 py-3 font-normal">Categoria</th>
              <th className="px-6 py-3 font-normal">Preço</th>
              <th className="px-6 py-3 font-normal">Variações</th>
              <th className="px-6 py-3 font-normal">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const variantCount = product.variants?.length ?? 0;
              const totalStock = (product.variants ?? []).reduce((sum, v) => sum + v.stock, 0);
              const photoCount = product.images?.length ?? 0;
              return (
                <tr key={product.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-neutral-100" />
                      ) : (
                        <span className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-300">
                          <ImageIcon size={18} />
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-400">{photoCount} foto{photoCount !== 1 && "s"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium">{product.name}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">{product.category}</span>
                  </td>
                  <td className="px-6 py-3">
                    {formatPrice(product.price)}
                    {product.oldPrice && (
                      <span className="ml-2 text-xs text-neutral-400 line-through">{formatPrice(product.oldPrice)}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-neutral-500">
                    {variantCount === 0 ? (
                      <span className="text-xs text-amber-600">Sem variações (não aparece disponível)</span>
                    ) : (
                      `${variantCount} variaç${variantCount === 1 ? "ão" : "ões"} · ${totalStock} un.`
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(product)} aria-label="Editar" className="text-[#8b1538] hover:text-[#71102d]">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(product)} aria-label="Excluir" className="text-neutral-400 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loadingProducts && products.length === 0 && (
          <p className="text-sm text-neutral-500 text-center py-8">Carregando produtos...</p>
        )}
        {!loadingProducts && filtered.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
}