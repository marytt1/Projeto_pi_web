import type { Product, ProductBadgeTone } from "../types/product";

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
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.soldOut && (
          <div className="absolute bottom-0 inset-x-0 bg-white/90 text-center text-xs py-2 text-neutral-500">
            Apenas poucas unidades disponível
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
            <span
              key={color}
              className="w-4 h-4 rounded-full border border-black/10"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-3">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="text-[11px] w-6 h-6 flex items-center justify-center rounded-full border border-neutral-300 text-neutral-500"
            >
              {size}
            </span>
          ))}
        </div>

        <button
          disabled={product.soldOut}
          className={`mt-4 w-full text-sm font-medium py-2.5 rounded-full transition-colors ${
            product.soldOut
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : "bg-[#8b1538] hover:bg-[#71102d] text-white"
          }`}
        >
          {product.soldOut ? "Produto Esgotado" : "🛍  Adicionar ao Carrinho"}
        </button>
      </div>
    </article>
  );
}
