import type { VideoItem } from "../types/video";
import topAliceImg from "../assets/top-alice.jpeg";
import shortsPietraImg from "../assets/shorts-pietra.jpeg";
import macaquinhoPaolaImg from "../assets/macaquinho-paola.jpeg";
import croppedJessicaImg from "../assets/cropped-manga-jessica.jpeg";
import croppedGrazyImg from "../assets/cropped-grazy.jpeg";

// Lista de vídeos simulados no momento a imagem estática
export const VIDEOS: VideoItem[] = [
  {
    id: "v1",
    caption: "Tecido com efeito modelador",
    thumb: croppedJessicaImg,
    productImage: croppedJessicaImg,
    productName: "Cropped Manga Longa Jessica",
    price: 189.9,
  },
  {
    id: "v2",
    caption: "Costura seamless, sem marcas",
    thumb: macaquinhoPaolaImg,
    productImage: macaquinhoPaolaImg,
    productName: "Macaquinho Paola",
    price: 219.9,
  },
  {
    id: "v3",
    caption: "Ela é de poliamida premium",
    thumb: shortsPietraImg,
    productImage: shortsPietraImg,
    productName: "Shorts Pietra",
    price: 129.9,
    oldPrice: 159.9,
  },
  {
    id: "v4",
    caption: "Caimento perfeito",
    thumb: croppedGrazyImg,
    productImage: croppedGrazyImg,
    productName: "Cropped Grazy",
    price: 99.9,
    oldPrice: 119.9,
  },
  {
    id: "v5",
    caption: "Elástico que não marca",
    thumb: topAliceImg,
    productImage: topAliceImg,
    productName: "Top Alice",
    price: 189.9,
    oldPrice: 239.9,
  },
];