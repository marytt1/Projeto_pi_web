import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { matchesSearch, normalizeText } from "../components/Search";
import CatalogProductCard from "../components/CatalogProductCard";
import { useShop } from "../components/ShopContext";
import { compareSizes } from "../services/adapters";
import { getColorName } from "../data/colors";
import type { ProductCategory } from "../types/product";

const CATEGORY_OPTIONS: ProductCategory[] = ["Cropped", "Leggings", "Macaquinho", "Shorts", "Top"];

// Página de catálogo com barra lateral de filtros interativos (categoria, tamanho, cor e preço) e listagem dinâmica de produtos
export default function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("categoria");
  const searchTerm = searchParams.get("busca") ?? "";

  const { products, loadingProducts, productsError, reloadProducts, isFavorite, toggleFavorite } = useShop();

  // Opções dos filtros: só o que existe nos produtos
  const categoryOptions = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  const sizeOptions = useMemo(
    () => [...new Set(products.flatMap((p) => p.sizes))].sort(compareSizes),
    [products]
  );

  const colorFilterOptions = useMemo(() => {
    const byName = new Map<string, string>();
    products.forEach((p) =>
      (p.colorOptions ?? []).forEach((c) => {
        if (!byName.has(c.name)) byName.set(c.name, c.hex);
      })
    );
    return [...byName].map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // Lê o ?categoria= da URL sem diferenciar maiúsculas, minúsculas e acentos
  function paramToCategories(): ProductCategory[] {
    if (!categoryParam) return [];
    const match = CATEGORY_OPTIONS.find((option) => normalizeText(option) === normalizeText(categoryParam));
    return match ? [match] : [];
  }

  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>(paramToCategories);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // nome da cor
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    setSelectedCategories(paramToCategories());
  }, [categoryParam]);

  function toggleCategory(category: ProductCategory) {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      // Se houver termo de busca, valida; se estiver vazio, passa livre
      if (searchTerm && !matchesSearch(searchTerm, product.name, product.category)) {
        return false;
      }
      
      // Filtro de Categoria
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }
      
      // Filtro de Tamanho (com proteção caso product.sizes seja undefined)
      if (selectedSize && !(product.sizes ?? []).includes(selectedSize)) {
        return false;
      }
      
      // Filtro de Cor (com proteção caso colorOptions seja undefined)
      if (selectedColor && !(product.colorOptions ?? []).some((c) => c.name === selectedColor)) {
        return false;
      }
      
      // Filtro de Preço Mínimo
      if (minPrice && product.price < Number(minPrice)) {
        return false;
      }
      
      // Filtro de Preço Máximo
      if (maxPrice && product.price > Number(maxPrice)) {
        return false;
      }

      return true;
    });
  }, [products, searchTerm, selectedCategories, selectedSize, selectedColor, minPrice, maxPrice]);
  
  return (
    <main className="px-6 md:px-10 py-10">
      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        {/* BARRA LATERAL (Filtros) */}
        <aside className="flex flex-col gap-8">
          <div>
            <h3 className="font-medium mb-3">Categoria</h3>
            <div className="flex flex-col gap-2">
              {categoryOptions.length === 0 && <p className="text-xs text-neutral-400">Nenhuma categoria ainda.</p>}
              {categoryOptions.map((category) => (
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
              {sizeOptions.length === 0 && <p className="text-xs text-neutral-400">Nenhum tamanho ainda.</p>}
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize((prev) => (prev === size ? null : size))}
                  className={`min-w-9 h-9 px-2 rounded-full border text-xs flex items-center justify-center transition-colors ${
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
              {colorFilterOptions.length === 0 && <p className="text-xs text-neutral-400">Nenhuma cor ainda.</p>}
              {colorFilterOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor((prev) => (prev === color.name ? null : color.name))}
                  aria-label={`Filtrar pela cor ${color.name}`}
                  className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    selectedColor === color.name
                      ? "border-[#8b1538] text-[#8b1538] bg-[#faf1f0]"
                      : "border-neutral-200 text-neutral-500"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color.hex }} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL (Listagem de produtos) */}
        <div>
          {searchTerm && (
            <p className="text-sm text-neutral-500 mb-4">
              Resultados para <strong className="text-[#8b1538]">"{searchTerm}"</strong>{" "}
              <button onClick={() => navigate("/catalogo")} className="ml-2 text-xs text-[#8b1538] underline">
                limpar busca
              </button>
            </p>
          )}

          {loadingProducts ? (
            <p className="text-sm text-neutral-500 text-center py-20">Carregando produtos...</p>
          ) : productsError ? (
            <div className="text-center py-20">
              <p className="text-sm text-red-600 mb-3">{productsError}</p>
              <button onClick={() => reloadProducts()} className="text-sm text-[#8b1538] underline">
                Tentar novamente
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
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
                  onToggleFavorite={() => toggleFavorite(product)}
                  onViewDetails={(id) => navigate(`/produto/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}