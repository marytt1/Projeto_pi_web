import type { CategoryItem } from "../types/category";

type CategoryCardProps = {
  category: CategoryItem;
};

//Componente de Card navegável de categoria com imagem de fundo, gradiente e chamada para ação
export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <a
      href="#produtos"
      className="relative shrink-0 w-[62%] sm:w-[40%] md:w-auto aspect-[3/4] overflow-hidden group snap-start"
    >
      <img
        src={category.image}
        alt={category.label}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-4 text-white">
        <span className="text-xs font-semibold tracking-widest uppercase">
          {category.label}
        </span>
        <span className="text-[10px] tracking-wide uppercase border-b border-white/70 pb-0.5 opacity-90 group-hover:opacity-100">
          Comprar Agora
        </span>
      </div>
    </a>
  );
}
