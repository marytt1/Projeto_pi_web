import type { VideoItem } from "../types/video";
import v1 from "../assets/v1.mp4";
import v2 from "../assets/v2.mp4";
import v3 from "../assets/v3.mp4";
import thumb1 from "../assets/image1.png";
import thumb2 from "../assets/image2.png";
import thumb3 from "../assets/image3.png";

// Lista de vídeos simulados no momento a imagem estática
export const VIDEOS: VideoItem[] = [
  {
    id: "v1",
    thumb: thumb1,
    videoUrl: v1
  },
  {
    id: "v2",
    thumb: thumb2,
    videoUrl: v2
  },
  {
    id: "v3",
    thumb: thumb3,
    videoUrl: v3
  }
]