import { Heart } from "lucide-react";
import type { Product } from "../types/product";

type CatalogProductCardProps = {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onViewDetails?: (id: string) => void;
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Componente de Card de produto para o catálogo que exibe foto, selo, opção de favoritar e botão para ver detalhes
export default function CatalogProductCard({
  product,
  isFavorite = false,
  onToggleFavorite,
  onViewDetails,
}: CatalogProductCardProps) {
  return (
    <article className="group">
      <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] rounded-lg">
        {product.badge && (
          <span className="absolute top-0 left-0 bg-[#8b1538] text-white text-[10px] font-medium px-3 py-1.5">
            {product.badge.label}
          </span>
        )}

        
        <button
          onClick={() => onToggleFavorite?.(product.id)}
          aria-label="Favoritar"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart
            size={15}
            className={isFavorite ? "fill-[#8b1538] text-[#8b1538]" : "text-neutral-500"}
          />
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="pt-3">
        <h3 className="text-sm text-[#3a3a3a]">{product.name}</h3>
        <p className="text-sm font-semibold text-[#8b1538] mt-1">
          {formatPrice(product.price)}
        </p>
        <button
          onClick={() => onViewDetails?.(product.id)}
          className="mt-3 w-full bg-[#f2b9c9] hover:bg-[#e9a0b6] transition-colors text-[#5c0f1c] text-sm font-medium py-2.5 rounded-full"
        >
          Ver Detalhes
        </button>
      </div>
    </article>
  );
}
