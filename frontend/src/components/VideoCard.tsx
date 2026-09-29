import { Play } from "lucide-react";
import type { VideoItem } from "../types/video";

type VideoCardProps = {
  video: VideoItem;
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Componente do Card no formato vertical estilo Reels com reprodução de vídeo, legenda e atalho rápido para visualização do produto
export default function VideoCard({ video }: VideoCardProps) {
  return (
    <article className="relative shrink-0 w-[220px] md:w-[240px] aspect-[9/16] rounded-2xl overflow-hidden snap-start group cursor-pointer">
      <img
        src={video.thumb}
        alt={video.productName}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/40 transition-colors">
          <Play size={18} className="text-white fill-white ml-0.5" />
        </span>
      </div>

       <p className="absolute bottom-[76px] left-3 right-3 text-white text-xs font-medium drop-shadow">
        {video.caption}
      </p>

      <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm px-2.5 py-2 flex items-center gap-2">
        <img
          src={video.productImage}
          alt=""
          className="w-9 h-9 rounded-lg object-cover shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[11px] text-[#3a3a3a] leading-tight truncate">
            {video.productName}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold text-[#8b1538]">
              {formatPrice(video.price)}
            </span>
            {video.oldPrice && (
              <span className="text-[10px] text-neutral-400 line-through">
                {formatPrice(video.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
