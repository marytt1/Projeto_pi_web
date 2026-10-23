import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { matchesSearch } from "../components/Search";
import CatalogProductCard from "../components/CatalogProductCard";
import { useShop } from "../components/ShopContext";
import { PRODUCTS } from "../data/products";
import type { ProductCategory } from "../types/product";

const CATEGORY_OPTIONS: ProductCategory[] = ["Cropped", "Macaquinho", "Shorts", "Top"];
const SIZE_OPTIONS = ["P", "M", "G", "GG"];
const COLOR_OPTIONS = ["#111111", "#8b1538", "#e0399c", "#f2b9c9"];

// Página de catálogo com barra lateral de filtros interativos (categoria, tamanho, cor e preço) e listagem dinâmica de produtos
export default function CatalogPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("categoria");
  const searchTerm = searchParams.get("busca") ?? "";

  function paramToCategories(): ProductCategory[] {
    return CATEGORY_OPTIONS.includes(categoryParam as ProductCategory)
      ? [categoryParam as ProductCategory]
      : [];
  }

  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>(paramToCategories);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const { isFavorite, toggleFavorite } = useShop();

  useEffect(() => {
    setSelectedCategories(paramToCategories());
  }, [categoryParam]);

  function toggleCategory(category: ProductCategory) {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      
      if (!matchesSearch(searchTerm, product.name, product.category)) {
        return false;
      }
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }
      if (selectedSize && !product.sizes.includes(selectedSize)) {
        return false;
      }
      if (selectedColor && !product.colors.includes(selectedColor)) {
        return false;
      }
      if (minPrice && product.price < Number(minPrice)) {
        return false;
      }
      if (maxPrice && product.price > Number(maxPrice)) {
        return false;
      }
      return true;
    });
  }, [searchTerm, selectedCategories, selectedSize, selectedColor, minPrice, maxPrice]);

  return (
    <>
      <main className="px-6 md:px-10 py-10">
        <div className="grid md:grid-cols-[220px_1fr] gap-10">
          <aside className="flex flex-col gap-8">
            <div>
              <h3 className="font-medium mb-3">Categoria</h3>
              <div className="flex flex-col gap-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <label key={category} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="accent-[#8b1538] w-4 h-4"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Tamanho</h3>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize((prev) => (prev === size ? null : size))}
                    className={`w-9 h-9 rounded-full border text-xs flex items-center justify-center transition-colors ${
                      selectedSize === size
                        ? "border-[#8b1538] text-[#8b1538] bg-[#faf1f0]"
                        : "border-neutral-200 text-neutral-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Cor</h3>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor((prev) => (prev === color ? null : color))}
                    aria-label={`Filtrar pela cor ${color}`}
                    className={`w-7 h-7 rounded-full border-2 ${
                      selectedColor === color ? "border-[#8b1538]" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Preço</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#8b1538]"
                />
                <span className="text-neutral-300">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#8b1538]"
                />
              </div>
            </div>
          </aside>

          <div>
            

            {searchTerm && (
              <p className="text-sm text-neutral-500 mb-4">
                Resultados para <strong className="text-[#8b1538]">"{searchTerm}"</strong>{" "}
                <button
                  onClick={() => navigate("/catalogo")}
                  className="ml-2 text-xs text-[#8b1538] underline"
                >
                  limpar busca
                </button>
              </p>
            )}

            {filteredProducts.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-20">
                Nenhum produto encontrado com esses filtros.
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {filteredProducts.map((product) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    isFavorite={isFavorite(product.id)}
                    
                    onToggleFavorite={() =>
                      toggleFavorite(
                        product,
                        selectedSize && product.sizes.includes(selectedSize) ? selectedSize : undefined,
                        selectedColor && product.colors.includes(selectedColor) ? selectedColor : undefined
                      )
                    }
                    onViewDetails={(id) => navigate(`/produto/${id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

    </>
  );
}