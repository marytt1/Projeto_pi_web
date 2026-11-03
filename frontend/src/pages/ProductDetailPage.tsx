import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ShoppingBag, Heart } from "lucide-react";
import type { Product } from "../types/product";
import { useShop } from "../components/ShopContext";
import { isCombinationAvailable, pickDefaultSelection, variantFor } from "../services/adapters";
import { getColorName } from "../data/colors";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Compara nomes de cor sem diferenciar maiúsculas/minúsculas nem espaços nas pontas
const sameColor = (a: string | null | undefined, b: string) =>
  a !== null && a !== undefined && a.trim().toLowerCase() === b.trim().toLowerCase();

// Página de detalhes do produto: galeria (por cor), seleção de cor e tamanho, compra e favoritos
export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, loadingProducts, productsError, reloadProducts } = useShop();

  if (loadingProducts) {
    return <p className="px-6 py-16 text-center text-sm text-neutral-500">Carregando produto...</p>;
  }

  if (productsError) {
    return (
      <main className="px-6 md:px-10 py-16 max-w-xl mx-auto text-center">
        <p className="text-sm text-red-600 mb-3">{productsError}</p>
        <button onClick={() => reloadProducts()} className="text-sm text-[#8b1538] underline">
          Tentar novamente
        </button>
      </main>
    );
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    if (loadingProducts) {
      return (
        <main className="px-6 md:px-10 py-16 max-w-xl mx-auto text-center">
          <p className="text-sm text-neutral-400">Carregando produto...</p>
        </main>
      );
    }

    return (
      <main className="px-6 md:px-10 py-16 max-w-xl mx-auto text-center">
        <h1 className="font-serif text-3xl text-[#8b1538]">Produto não encontrado</h1>
        {productsError && <p className="text-sm text-red-600 mt-3">{productsError}</p>}
        <Link to="/catalogo" className="inline-block mt-4 text-sm text-[#8b1538] hover:underline">
          Voltar ao catálogo
        </Link>
      </main>
    );
  }

  // key: ao ir de um produto para outro, a escolha de cor e tamanho recomeça
  return <ProductDetail key={product.id} product={product} />;
}

type ProductDetailProps = { product: Product };

function ProductDetail({ product }: ProductDetailProps) {
  const colorOptions = product.colorOptions ?? [];
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]?.name ?? "");
  const [chosenSize, setChosenSize] = useState(product.sizes[0] ?? "");
  const [activeIndex, setActiveIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState("");
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const favorite = isFavorite(product.id);

  function stockFor(size: string, colorName: string) {
    return product.variants?.find((v) => v.size === size && v.colorName === colorName)?.stock ?? 0;
  }

  // Só os tamanhos que existem para a cor escolhida
  const sizesForColor = product.sizes.filter((size) =>
    product.variants?.some((v) => v.colorName === selectedColor && v.size === size)
  );

  // Se o tamanho escolhido não existe nessa cor, usa o primeiro com estoque
  const selectedSize = sizesForColor.includes(chosenSize)
    ? chosenSize
    : (sizesForColor.find((size) => stockFor(size, selectedColor) > 0) ?? sizesForColor[0] ?? "");

  // Galeria: fotos da cor escolhida + fotos gerais. Sem foto da cor, mostra as gerais (ou todas)
  const allImages = product.images ?? [];
  const colorImages = allImages.filter((i) => sameColor(i.colorName, selectedColor));
  const generalImages = allImages.filter((i) => i.colorName === null);
  const shown = colorImages.length > 0 ? [...colorImages, ...generalImages] : generalImages.length > 0 ? generalImages : allImages;
  const gallery = shown.map((i) => i.url);
  if (gallery.length === 0 && product.image) gallery.push(product.image);
  const activeImage = gallery[Math.min(activeIndex, Math.max(gallery.length - 1, 0))] ?? "";

  const selectedStock = selectedSize ? stockFor(selectedSize, selectedColor) : 0;
  const unavailable = product.soldOut || selectedStock <= 0;

  function handleAddToCart() {
    setMessage("");
    if (selectedStock <= 0) {
      setMessage("Essa combinação de cor e tamanho está esgotada.");
      return;
    }
    // false = visitante sem login (o modal de login já abriu) ou combinação indisponível
    if (!addToCart(product, selectedSize, selectedColor)) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <main className="px-6 md:px-10 py-8 max-w-6xl mx-auto">
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#8b1538] mb-6"
      >
        <ArrowLeft size={14} />
        Voltar ao Catálogo
      </Link>

      <div className="grid md:grid-cols-[100px_1fr_1fr] gap-6">
        <div className="flex md:flex-col gap-3 order-2 md:order-1">
          {gallery.length > 1 &&
            gallery.map((thumb, index) => (
              <button
                key={`${thumb}-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`w-full aspect-square rounded-lg overflow-hidden border-2 ${
                  activeImage === thumb ? "border-[#8b1538]" : "border-transparent"
                }`}
              >
                <img src={thumb} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
        </div>

        <div className="order-1 md:order-2 aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100">
          {activeImage ? (
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-neutral-300">Sem imagem</div>
          )}
        </div>

        <div className="order-3">
          <h1 className="font-serif text-3xl text-[#8b1538]">{product.name}</h1>
          <p className="text-sm text-neutral-600 mt-4 leading-relaxed">
            {product.description ||
              "Peça versátil e elegante, com design moderno e confortável, que proporciona liberdade de movimento e muito estilo."}
          </p>

          <hr className="my-5 border-neutral-100" />

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-[#8b1538]">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-lg text-neutral-400 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>

          {colorOptions.length === 0 ? (
            <p className="mt-5 text-sm text-neutral-400">Este produto ainda não tem cores e tamanhos cadastrados.</p>
          ) : (
            <>
              <p className="text-xs text-neutral-500 mt-5">Cor: {selectedColor}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setActiveIndex(0); // volta para a primeira foto da cor
                      setMessage("");
                    }}
                    aria-label={`Cor ${color.name}`}
                    title={color.name}
                    className={`w-7 h-7 rounded-full border-2 ${
                      selectedColor === color.name ? "border-[#8b1538]" : "border-transparent ring-1 ring-black/10"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>

              <p className="text-xs text-neutral-500 mt-4">Tamanho: {selectedSize}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {sizesForColor.map((size) => {
                  const hasStock = stockFor(size, selectedColor) > 0;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setChosenSize(size);
                        setMessage("");
                      }}
                      className={`min-w-10 h-9 px-2 rounded-lg border text-sm transition-colors ${
                        selectedSize === size
                          ? "bg-[#8b1538] text-white border-[#8b1538]"
                          : hasStock
                            ? "border-neutral-200 text-neutral-500"
                            : "border-neutral-100 text-neutral-300 line-through"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {message && <p className="text-xs text-red-600 mt-3">{message}</p>}

          {available && stock !== undefined && stock <= 3 && (
            <p className="text-xs text-amber-600 mt-3">
              Restam apenas {stock} unidade{stock !== 1 && "s"}.
            </p>
          )}

          <button
            disabled={unavailable}
            onClick={handleAddToCart}
            className={`w-full mt-6 flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-full transition-colors ${
              unavailable
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : added
                  ? "bg-emerald-600 text-white"
                  : "bg-[#8b1538] hover:bg-[#71102d] text-white"
            }`}
          >
            <ShoppingBag size={16} />
            {unavailable ? "Esgotado" : added ? "Adicionado ao carrinho!" : "Adicionar ao Carrinho"}
          </button>

          <button
            onClick={() => toggleFavorite(product)}
            className="w-full mt-3 flex items-center justify-center gap-2 border border-[#8b1538] text-[#8b1538] hover:bg-[#faf1f0] transition-colors text-sm font-medium py-3 rounded-full"
          >
            <Heart size={16} className={favorite ? "fill-[#8b1538]" : ""} />
            {favorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
          </button>
        </div>
      </div>
    </main>
  );
}
