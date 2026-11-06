import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronDown } from "lucide-react";
import { matchesSearch, normalizeText } from "../components/Search";
import CatalogProductCard from "../components/CatalogProductCard";
import { useShop } from "../components/ShopContext";
import { compareSizes } from "../services/adapters";
import type { ProductCategory } from "../types/product";

// Página de catálogo com barra lateral de filtros interativos (categoria, tamanho, cor e preço) e listagem dinâmica de produtos
export default function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Categorias marcadas
  const categoryParam = searchParams.get("categoria") ?? "";
  const selectedCategories = useMemo(
    () =>
      categoryParam
        .split(",")
        .map((raw) => categoryOptions.find((opt) => normalizeText(opt) === normalizeText(raw)))
        .filter((c): c is ProductCategory => Boolean(c)),
    [categoryParam, categoryOptions]
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // nome da cor
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Seletor de cor (dropdown)
  const [colorOpen, setColorOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setColorOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setColorOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const selectedColorHex = colorFilterOptions.find((c) => c.name === selectedColor)?.hex;

  function toggleCategory(category: ProductCategory) {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    const params = new URLSearchParams(searchParams);
    if (next.length) params.set("categoria", next.join(","));
    else params.delete("categoria");
    setSearchParams(params, { replace: true });
  }

  function chooseColor(name: string | null) {
    setSelectedColor(name);
    setColorOpen(false);
  }

  // Aviso simples quando o preço mínimo é maior que o máximo
  const invalidPriceRange = minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice);

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

      // Filtro de Tamanho 
      if (selectedSize && !(product.sizes ?? []).includes(selectedSize)) {
        return false;
      }

      // Filtro de Cor 
      if (selectedColor && !(product.colorOptions ?? []).some((c) => c.name === selectedColor)) {
        return false;
      }

      // Filtro de Preço Mínimo / Máximo 
      const price = Number(product.price);
      if (minPrice !== "" && price < Number(minPrice)) {
        return false;
      }
      if (maxPrice !== "" && price > Number(maxPrice)) {
        return false;
      }

      return true;
    });
  }, [products, searchTerm, selectedCategories, selectedSize, selectedColor, minPrice, maxPrice]);

  return (
    <main className="px-6 md:px-10 py-10">
      <div className="grid md:grid-cols-[220px_1fr] gap-10">
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
            <div ref={colorRef} className="relative">
              <button
                type="button"
                onClick={() => setColorOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={colorOpen}
                className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm text-left outline-none transition-colors ${
                  colorOpen || selectedColor ? "border-[#8b1538]" : "border-neutral-200"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  {selectedColor ? (
                    <>
                      <span
                        className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: selectedColorHex }}
                      />
                      <span className="truncate">{selectedColor}</span>
                    </>
                  ) : (
                    <span className="text-neutral-400">Todas as cores</span>
                  )}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-neutral-400 transition-transform ${colorOpen ? "rotate-180" : ""}`}
                />
              </button>

              {colorOpen && (
                <ul
                  role="listbox"
                  aria-label="Filtrar por cor"
                  className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-neutral-200 rounded-lg shadow-lg py-1"
                >
                  <li role="option" aria-selected={!selectedColor}>
                    <button
                      type="button"
                      onClick={() => chooseColor(null)}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-neutral-50 ${
                        !selectedColor ? "text-[#8b1538] font-medium" : "text-neutral-500"
                      }`}
                    >
                      Todas as cores
                    </button>
                  </li>
                  {colorFilterOptions.length === 0 && (
                    <li className="px-3 py-2 text-xs text-neutral-400">Nenhuma cor ainda.</li>
                  )}
                  {colorFilterOptions.map((color) => (
                    <li key={color.name} role="option" aria-selected={selectedColor === color.name}>
                      <button
                        type="button"
                        onClick={() => chooseColor(color.name)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-50 ${
                          selectedColor === color.name ? "text-[#8b1538] font-medium bg-[#faf1f0]" : "text-neutral-600"
                        }`}
                      >
                        <span
                          className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="truncate">{color.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Preço</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="Mín."
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                aria-label="Preço mínimo"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#8b1538]"
              />
              <span className="text-neutral-300">-</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="Máx."
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                aria-label="Preço máximo"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#8b1538]"
              />
            </div>
            {invalidPriceRange && (
              <p className="mt-2 text-xs text-red-600">O preço mínimo está maior que o máximo.</p>
            )}
          </div>
        </aside>

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