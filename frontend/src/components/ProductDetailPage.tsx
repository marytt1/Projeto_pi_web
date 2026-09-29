import { useState } from "react";
import { ArrowLeft, ShoppingBag, Heart } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { PRODUCTS } from "../data/products";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type ProductDetailPageProps = {
  productId?: string;
};

// Componente da Página de detalhes do produto que exibe galeria de imagens, informações do item, seleção de cor e tamanho, e ações de compra e favoritos
export default function ProductDetailPage({ productId = "cropped-grazy" }: ProductDetailPageProps) {
  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];

  const gallery = [product.image, product.image, product.image];

  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);

  return (
    <div className="font-sans text-[#3a3a3a]">
      <Header />

      <main className="px-6 md:px-10 py-8 max-w-6xl mx-auto">
        <a href="#" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#8b1538] mb-6">
          <ArrowLeft size={14} />
          Voltar ao Catálogo
        </a>

        <div className="grid md:grid-cols-[100px_1fr_1fr] gap-6">
          <div className="flex md:flex-col gap-3 order-2 md:order-1">
            {gallery.map((thumb, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(thumb)}
                className={`w-full aspect-square rounded-lg overflow-hidden border-2 ${
                  activeImage === thumb ? "border-[#8b1538]" : "border-transparent"
                }`}
              >
                <img src={thumb} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="order-1 md:order-2 aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100">
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="order-3">
            <h1 className="font-serif text-3xl text-[#8b1538]">{product.name}</h1>

            <p className="text-sm text-neutral-600 mt-4 leading-relaxed">
              Peça versátil e elegante, perfeita para acompanhar diferentes
              momentos do seu dia. Com design moderno e confortável,
              proporciona liberdade de movimento e muito estilo.
            </p>
            <p className="text-sm italic text-[#8b1538] mt-2">
              Uma peça prática para você se sentir bem e confiante em
              qualquer ocasião.
            </p>

            <hr className="my-5 border-neutral-100" />

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-[#8b1538]">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-lg text-neutral-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

           <div className="flex items-center gap-2 mt-5">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Cor ${color}`}
                  className={`w-7 h-7 rounded-full border-2 ${
                    selectedColor === color ? "border-[#8b1538]" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-9 rounded-lg border text-sm transition-colors ${
                    selectedSize === size
                      ? "bg-[#8b1538] text-white border-[#8b1538]"
                      : "border-neutral-200 text-neutral-500"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              disabled={product.soldOut}
              className={`w-full mt-6 flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-full transition-colors ${
                product.soldOut
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : "bg-[#8b1538] hover:bg-[#71102d] text-white"
              }`}
            >
              <ShoppingBag size={16} />
              {product.soldOut ? "Produto Esgotado" : "Adicionar ao Carrinho"}
            </button>

            <button className="w-full mt-3 flex items-center justify-center gap-2 border border-[#8b1538] text-[#8b1538] hover:bg-[#faf1f0] transition-colors text-sm font-medium py-3 rounded-full">
              <Heart size={16} />
              Adicionar aos Favoritos
            </button>

            <p className="text-xs text-neutral-400 mt-4">
              Selecionado: {selectedSize} · variação escolhida em destaque acima
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
