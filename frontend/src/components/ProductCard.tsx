import { useState } from "react";
import type { Product, ProductBadgeTone } from "../types/product";
import { isCombinationAvailable, pickDefaultSelection } from "../services/adapters";
import { getColorName } from "../data/colors";
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

// Componente do Card de produto em destaque que exibe foto, selo personalizado, preço com desconto, opções de cores, tamanhos e botão de compra
export default function ProductCard({ product }: ProductCardProps) {

  const { addToCart } = useShop();

  // Começa na primeira combinação de cor e tamanho que tem estoque
  const initial = pickDefaultSelection(product);
  const [selectedColor, setSelectedColor] = useState(initial.color);
  const [selectedSize, setSelectedSize] = useState(initial.size);
  const [added, setAdded] = useState(false);

  // false quando essa cor + tamanho não existem ou estão sem estoque
  const available = isCombinationAvailable(product, selectedSize, selectedColor);

  // Ao trocar a cor, se o tamanho escolhido não existe nela, vai para o primeiro tamanho que existe
  function handleColorChange(color: string) {
    setSelectedColor(color);
    if (!isCombinationAvailable(product, selectedSize, color)) {
      const firstSize = product.sizes.find((size) => isCombinationAvailable(product, size, color));
      if (firstSize) setSelectedSize(firstSize);
    }
  }

  function handleAddToCart() {
    if (!addToCart(product, selectedSize, selectedColor)) return;

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const blocked = product.soldOut || !available;

  return (
    <article className="group">
      <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
        {product.badge && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-medium px-2.5 py-1 rounded-full ${
              BADGE_TONE_CLASSES[product.badge.tone]
            }`}
          >
            {product.badge.label}
          </span>
        )}
        <span className="absolute top-3 right-3 text-[10px] font-medium text-white/90">
          {product.category}
        </span>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300">Sem imagem</div>
        )}
        {product.soldOut && (
          <div className="absolute bottom-0 inset-x-0 bg-white/90 text-center text-xs py-2 text-neutral-500">
            Produto esgotado
          </div>
        )}
      </div>

      <div className="pt-4">
        <h3 className="text-sm font-medium text-[#3a3a3a]">{product.name}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[#8b1538] font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          {product.colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              aria-label={`Cor ${getColorName(color)}`}
              title={getColorName(color)}
              className={`w-4 h-4 rounded-full border ${
                selectedColor === color
                  ? "border-[#8b1538] ring-1 ring-[#8b1538] ring-offset-1"
                  : "border-black/10"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-3">
          {product.sizes.map((size) => {
            const sizeAvailable = isCombinationAvailable(product, size, selectedColor);

            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                disabled={!sizeAvailable}
                title={sizeAvailable ? undefined : "Indisponível nesta cor"}
                className={`text-[11px] w-6 h-6 flex items-center justify-center rounded-full border transition-colors ${
                  !sizeAvailable
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
          disabled={blocked}
          onClick={handleAddToCart}
          className={`mt-4 w-full text-sm font-medium py-2.5 rounded-full transition-colors ${
            blocked
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : added
              ? "bg-emerald-600 text-white"
              : "bg-[#8b1538] hover:bg-[#71102d] text-white"
          }`}
        >
          {product.soldOut ? "Produto Esgotado" : !available ? "Combinação indisponível" : added ? "✓ Adicionado!" : "Adicionar ao Carrinho"}
        </button>
      </div>
    </article>
  );
}
