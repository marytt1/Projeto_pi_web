import { useState, useRef } from "react";
import { Play } from "lucide-react";
import type { VideoItem } from "../types/video";

type VideoCardProps = {
  video: VideoItem;
};

// Componente do Card no formato vertical estilo Reels com reprodução de vídeo
export default function VideoCard({ video }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <article
      onClick={togglePlay}
      className="relative shrink-0 w-[220px] md:w-[240px] aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer select-none"
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumb}
        loop
        playsInline
        onEnded={() => setIsPlaying(false)}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <span className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/50 transition-colors">
            <Play size={20} className="text-white fill-white ml-0.5" />
          </span>
        </div>
      )}
    </article>
  );
}