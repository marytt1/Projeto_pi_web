import { useState } from "react";
import { Link } from "react-router";
import { Heart } from "lucide-react";
import type { Product, ProductBadgeTone } from "../types/product";
import { useShop } from "./ShopContext";

type ProductCardProps = {
  product: Product;
};

const BADGE_TONE_CLASSES: Record<ProductBadgeTone, string> = {
  promo: "bg-[#8b1538] text-white",
  estoque: "bg-[#e0a838] text-white",
  novo: "bg-[#3a3a3a] text-white",
  vendido: "bg-[#8b1538] text-white",
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Compara nomes de cor sem diferenciar
const sameColor = (a: string | null | undefined, b: string) =>
  a !== null && a !== undefined && a.trim().toLowerCase() === b.trim().toLowerCase();

// Componente do Card de produto em destaque que exibe foto, selo personalizado, preço com desconto, opções de cores, tamanhos e botão de compra
export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const favorite = isFavorite(product.id);

  const colorOptions = product.colorOptions ?? [];
  const variants = product.variants ?? [];

  const [selectedColor, setSelectedColor] = useState(colorOptions[0]?.name ?? "");
  const [chosenSize, setChosenSize] = useState(product.sizes[0] ?? "");
  const [added, setAdded] = useState(false);
  const [notice, setNotice] = useState("");

  function stockFor(size: string, colorName: string) {
    return variants.find((v) => v.size === size && v.colorName === colorName)?.stock ?? 0;
  }

  // Só os tamanhos que existem para a cor escolhida
  const sizesForColor = product.sizes.filter((size) =>
    variants.some((v) => v.colorName === selectedColor && v.size === size)
  );

  const selectedSize = sizesForColor.includes(chosenSize) && stockFor(chosenSize, selectedColor) > 0
    ? chosenSize
    : (sizesForColor.find((size) => stockFor(size, selectedColor) > 0) ?? sizesForColor[0] ?? "");

  // Foto do card: a primeira da cor escolhida; sem foto da cor, a primeira geral; senão a capa
  const images = product.images ?? [];
  const colorImage = images.find((i) => sameColor(i.colorName, selectedColor));
  const generalImage = images.find((i) => i.colorName === null);
  const cardImage = colorImage?.url ?? generalImage?.url ?? product.image;

  const selectedStock = selectedSize ? stockFor(selectedSize, selectedColor) : 0;
  const unavailable = product.soldOut || selectedStock <= 0;

  // Link dos detalhes, já levando a cor e o tamanho escolhidos
  const params = new URLSearchParams();
  if (selectedColor) params.set("cor", selectedColor);
  if (selectedSize) params.set("tamanho", selectedSize);
  const query = params.toString();
  const detailsUrl = `/produto/${product.id}${query ? `?${query}` : ""}`;

  // Favorita ou desfavorita (se não estiver logada, o site pede o login)
  function handleToggleFavorite() {
    toggleFavorite(product);
  }

  function handleAddToCart() {
    setNotice("");
    if (selectedStock <= 0) {
      setNotice("Essa combinação de cor e tamanho está esgotada.");
      return;
    }
    if (!addToCart(product, selectedSize, selectedColor)) {
      setNotice("Combinação indisponível ou faça login.");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const buttonLabel = product.soldOut
    ? "Produto Esgotado"
    : selectedStock <= 0
    ? "Combinação Esgotada"
    : added
    ? "✓ Adicionado!"
    : "Adicionar ao Carrinho";

  return (
    <article className="group">
      <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
        <Link
          to={detailsUrl}
          aria-label={`Ver detalhes de ${product.name}`}
          className="absolute inset-0 block"
        >
          {product.badge && (
            <span
              className={`absolute top-3 left-3 z-10 text-[10px] font-medium px-2.5 py-1 rounded-full ${
                BADGE_TONE_CLASSES[product.badge.tone]
              }`}
            >
              {product.badge.label}
            </span>
          )}
          <img
            src={cardImage}
            alt={`${product.name}${selectedColor ? ` - ${selectedColor}` : ""}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.soldOut && (
            <div className="absolute bottom-0 inset-x-0 bg-white/90 text-center text-xs py-2 text-neutral-500">
              Esgotado
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={favorite ? "Remover dos favoritos" : "Favoritar"}
          aria-pressed={favorite}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition-colors"
        >
          <Heart
            size={15}
            className={favorite ? "fill-[#8b1538] text-[#8b1538]" : "text-neutral-500"}
          />
        </button>
      </div>

      <div className="pt-4">
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-0.5">{product.category}</p>
        <h3 className="text-sm font-medium text-[#3a3a3a]">
          <Link to={detailsUrl} className="hover:text-[#8b1538] transition-colors">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[#8b1538] font-semibold">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-neutral-400 line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>

        {colorOptions.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.name)}
                  aria-label={`Cor ${color.name}`}
                  aria-pressed={selectedColor === color.name}
                  title={color.name}
                  className={`w-4 h-4 rounded-full border ${
                    selectedColor === color.name
                      ? "border-[#8b1538] ring-1 ring-[#8b1538] ring-offset-1"
                      : "border-black/10"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-500">{selectedColor}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {sizesForColor.map((size) => {
            const outOfStock = stockFor(size, selectedColor) <= 0;
            return (
              <button
                key={size}
                type="button"
                disabled={outOfStock}
                onClick={() => setChosenSize(size)}
                title={outOfStock ? "Esgotado nessa cor" : undefined}
                className={`text-[11px] w-6 h-6 flex items-center justify-center rounded-full border transition-colors ${
                  outOfStock
                    ? "border-neutral-200 text-neutral-300 line-through cursor-not-allowed"
                    : selectedSize === size
                    ? "bg-[#8b1538] border-[#8b1538] text-white"
                    : "border-neutral-300 text-neutral-500"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>

        <button
          disabled={unavailable}
          onClick={handleAddToCart}
          className={`mt-4 w-full text-sm font-medium py-2.5 rounded-full transition-colors ${
            unavailable
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : added
              ? "bg-emerald-600 text-white"
              : "bg-[#8b1538] hover:bg-[#71102d] text-white"
          }`}
        >
          {buttonLabel}
        </button>
        {notice && <p className="text-[11px] text-red-600 mt-2">{notice}</p>}
      </div>
    </article>
  );
}