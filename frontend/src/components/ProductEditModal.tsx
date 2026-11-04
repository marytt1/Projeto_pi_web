
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { X, ImagePlus } from "lucide-react";
import { ApiError, imageUrl, products as productsApi } from "../services/api";
import type { ApiProduct } from "../services/adapters";
import { makePreview, revokePreview, validateImageFile } from "../services/imageFile";
import { useOrders } from "./OrdersContext";

type ProductEditModalProps = {
  productId: string;
  onClose: () => void;
  onSaved?: (message: string) => void;
};

// Mesma lista de categorias do catálogo
const CATEGORY_OPTIONS = ["Top", "Shorts", "Macaquinho", "Cropped", "Leggings"];

const INPUT_CLASS =
  "w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8b1538]";

// Janela para editar um produto: nome, categoria, preço, descrição e imagem.
// Vale para o produto inteiro (todas as cores e tamanhos dele).
export default function ProductEditModal({ productId, onClose, onSaved }: ProductEditModalProps) {
  const { updateProduct } = useOrders();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);

  const [currentImage, setCurrentImage] = useState<string | null>(null); // imagem que o produto tem hoje
  const [newImage, setNewImage] = useState<File | null>(null); // imagem escolhida agora (opcional)
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Busca os dados atuais do produto na API
  useEffect(() => {
    let cancelled = false;

    productsApi
      .get(productId)
      .then((data: { product: ApiProduct }) => {
        if (cancelled) return;
        const product = data.product;
        setName(product.name);
        setDescription(product.description ?? "");
        setPrice(String(product.price));
        setCategory(product.category);
        setCurrentImage(imageUrl(product.image_url));
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof ApiError ? e.message : "Não foi possível carregar o produto.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  function close() {
    revokePreview(preview);
    onClose();
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    revokePreview(preview);

    if (!file) {
      setNewImage(null);
      setPreview(null);
      return;
    }

    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      event.target.value = "";
      setNewImage(null);
      setPreview(null);
      return;
    }

    setError("");
    setNewImage(file);
    setPreview(makePreview(file));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const priceNumber = Number(price.replace(",", "."));
    if (!name.trim()) {
      setError("Informe o nome do produto.");
      return;
    }
    if (price.trim() === "" || Number.isNaN(priceNumber) || priceNumber <= 0) {
      setError("Informe um preço maior que zero.");
      return;
    }

    setSaving(true);
    const result = await updateProduct(
      productId,
      { name: name.trim(), description: description.trim(), price: priceNumber, category },
      newImage
    );
    setSaving(false);

    if (result.ok) {
      revokePreview(preview);
      onSaved?.("Produto atualizado com sucesso.");
      onClose();
    } else {
      setError(result.message ?? "Não foi possível salvar o produto.");
    }
  }

  // Se a categoria atual não está na lista (produto antigo), ela continua disponível na escolha
  const categoryOptions = CATEGORY_OPTIONS.includes(category) ? CATEGORY_OPTIONS : [category, ...CATEGORY_OPTIONS];

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-start justify-center pt-16 px-4 z-[60] overflow-y-auto"
      onClick={() => {
        if (!saving) close();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative mb-10"
      >
        <button
          onClick={close}
          disabled={saving}
          aria-label="Fechar"
          className="absolute top-5 right-5 text-neutral-400 hover:text-[#3a3a3a]"
        >
          <X size={18} />
        </button>

        <h2 className="font-serif text-2xl text-[#8b1538] mb-1">Editar produto</h2>
        <p className="text-xs text-neutral-400 mb-6">
          As mudanças valem para o produto inteiro (todas as cores e tamanhos dele).
        </p>

        {loading && <p className="text-sm text-neutral-400 py-8 text-center">Carregando...</p>}
        {loadError && <p className="text-sm text-red-600 py-4 text-center">{loadError}</p>}

        {!loading && !loadError && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-neutral-500 mb-1.5 block">Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-500 mb-1.5 block">Categoria</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_CLASS}>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1.5 block">Preço (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-500 mb-1.5 block">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={1000}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="text-xs text-neutral-500 mb-1.5 block">Imagem</label>
              <div className="flex items-center gap-4">
                {preview || currentImage ? (
                  <img
                    src={preview ?? currentImage ?? undefined}
                    alt="Imagem do produto"
                    className="w-20 h-20 rounded-lg object-cover border border-neutral-100"
                  />
                ) : (
                  <span className="w-20 h-20 rounded-lg bg-neutral-50 border border-dashed border-neutral-200 flex items-center justify-center text-neutral-300">
                    <ImagePlus size={22} />
                  </span>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFile}
                    className="text-xs w-full"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    JPG, PNG ou WebP, até 3 MB. {newImage ? "A nova imagem será enviada ao salvar." : "Deixe em branco para manter a atual."}
                  </p>
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-3 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
