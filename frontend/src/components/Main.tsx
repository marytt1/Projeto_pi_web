import { useState } from "react";
import heroImage from "../assets/banner.jpg";

import Section from "./Section";
import ProductCard from "./ProductCard";
import CategoryCard from "./CategoryCard";
import VideoCard from "./VideoCard";
import InstagramIcon from "./icons/InstagramIcon";

import { PRODUCTS } from "../data/products";
import { CATEGORIES } from "../data/categories";
import { VIDEOS } from "../data/videos";
import { FEATURES } from "../data/features";
import { SIZE_TABLE } from "../data/sizeTable";
import { INSTAGRAM_POSTS } from "../data/instagram";

const HIDE_SCROLLBAR =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const FILTERS = ["Todos", "Top", "Shorts", "Macaquinho", "Cropped"] as const;

// Componente principal da página inicial que reúne hero, categorias, produtos em destaque, vídeos, guia de tamanhos, diferenciais da marca e feed do Instagram
export default function Main() {
  return (
    <main>
      <Hero />
      <CategoryShowcase />
      <FeaturedProducts />
      <VideoDetails />
      <SizeGuide />
      <Features />
      <InstagramFeed />
    </main>
  );
}


function Hero() {
  return (
    <section className="relative">
      <img
        src={heroImage}
        alt="Modelos vestindo peças de fitness wear La Rose"
        className="w-full h-[420px] md:h-[560px] object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 text-white max-w-xl">
        <p className="text-xs tracking-widest uppercase mb-3 text-white/80">
          Santa Cruz das Palmeiras · SP
        </p>
        <h2 className="font-serif text-4xl md:text-6xl leading-tight">
          Elegância que
          <br />
          <span className="italic">abraça você</span>
        </h2>
        <p className="mt-4 text-sm md:text-base text-white/90 max-w-sm">
          Lingerie e fitness wear selecionados para celebrar cada curva com
          sofisticação e conforto real.
        </p>
        <div className="flex flex-wrap gap-4 mt-8">
          <a
            href="#produtos"
            className="bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium px-6 py-3 rounded-full"
          >
            Explorar Coleção →
          </a>
          <a
            href="#guia-tamanhos"
            className="bg-white/90 hover:bg-white transition-colors text-[#3a3a3a] text-sm font-medium px-6 py-3 rounded-full"
          >
            Guia de Tamanhos
          </a>
        </div>
      </div>
    </section>
  );
}


function CategoryShowcase() {
  return (
    <Section title="Compre por Categorias" className="py-14">
      <div className={`flex overflow-x-auto md:grid md:grid-cols-5 gap-1 px-1 snap-x snap-mandatory ${HIDE_SCROLLBAR}`}>
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </Section>
  );
}


function FeaturedProducts() {
 const [active, setActive] = useState<(typeof FILTERS)[number]>("Todos");

  const filtered =
    active === "Todos" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);

  return (
    <Section
      id="produtos"
      eyebrow="Nossa Coleção Pilates"
      title="Produtos em Destaque"
      align="start"
      headerActions={
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActive(filter)}
              className={`text-sm px-4 py-2 rounded-full transition-colors ${
                active === filter
                  ? "bg-[#8b1538] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}


function VideoDetails() {
  return (
    <Section title="Descubra cada detalhe em vídeo">
      <div className={`flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory ${HIDE_SCROLLBAR}`}>
        {VIDEOS.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </Section>
  );
}

function SizeGuide() {
  
  const [measurements, setMeasurements] = useState({
    bust: "",
    waist: "",
    hip: "",
  });

  return (
    <Section
      id="guia-tamanhos"
      eyebrow="Ferramenta de Medidas"
      title="Guia de Tamanhos & Provador Virtual"
      description="Informe suas medidas e encontre o tamanho ideal para cada peça da coleção La Rose."
      className="bg-[#faf5f2]"
    >
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl p-8">
          <h3 className="font-medium text-[#3a3a3a] mb-6">
            Suas Medidas (em centímetros)
          </h3>

          <div className="space-y-5">
            {(["bust", "waist", "hip"] as const).map((field) => (
              <div key={field}>
                <label className="text-xs text-neutral-500 flex items-center gap-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8b1538]" />
                  {field === "bust" ? "Busto" : field === "waist" ? "Cintura" : "Quadril"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={field === "bust" ? "ex: 88" : field === "waist" ? "ex: 68" : "ex: 94"}
                    value={measurements[field]}
                    // Atualiza só o campo alterado, mantendo os outros dois
                    onChange={(e) =>
                      setMeasurements((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    className="w-full border border-neutral-200 rounded-lg px-4 py-3 pr-12 text-sm outline-none focus:border-[#8b1538]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                    cm
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-8 w-full bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium py-3 rounded-full">
            ✏️ Calcular Meu Tamanho
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-8">
            <h3 className="font-medium text-[#3a3a3a] mb-4">Tabela de Referência</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-400 text-xs">
                  <th className="pb-3 font-normal">Tam.</th>
                  <th className="pb-3 font-normal">Busto</th>
                  <th className="pb-3 font-normal">Cintura</th>
                  <th className="pb-3 font-normal">Quadril</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_TABLE.map((row) => (
                  <tr key={row.size} className="border-t border-neutral-100">
                    <td className="py-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#8b1538] text-white text-xs">
                        {row.size}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-600">{row.bust}</td>
                    <td className="py-3 text-neutral-600">{row.waist}</td>
                    <td className="py-3 text-neutral-600">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-neutral-400 mt-4">
              * Valores em centímetros. Peças com elastano podem ter margem de
              tamanho. Em caso de dúvida, recomendamos o tamanho maior.
            </p>
          </div>

          <div className="bg-[#f6d4de] rounded-2xl p-6 text-sm text-[#5c0f1c]">
            <p className="font-medium mb-1">Não tem fita métrica?</p>
            <p className="text-[#5c0f1c]/80">
              Entre em contato via WhatsApp e nossa consultora de moda íntima
              vai te ajudar a encontrar o tamanho perfeito.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}


function Features() {
  return (
    <Section eyebrow="Precisão & Propósito" title="O Padrão La Rose">
      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-[#faf1f0] rounded-2xl p-6 flex gap-4 items-start">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#8b1538] text-white shrink-0">
              <Icon size={18} />
            </span>
            <div>
              <h3 className="text-sm font-medium text-[#3a3a3a] mb-1">{title}</h3>
              <p className="text-sm text-neutral-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}


function InstagramFeed() {
  return (
    <section className="bg-[#2a2a2a] py-2">
      <div className="flex items-center gap-2 px-6 md:px-10 pt-8 pb-6">
        <InstagramIcon size={16} className="text-[#e0399c]" />
        <span className="text-xs tracking-widest uppercase text-white/70">Siga-nos</span>
        <span className="text-sm text-white ml-1">@larose_modaintima</span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6">
        {INSTAGRAM_POSTS.map((post) => (
          <a
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group overflow-hidden"
          >
            <img
              src={post.image}
              alt="Publicação do Instagram La Rose"
              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </a>
        ))}
      </div>
    </section>

  );
}