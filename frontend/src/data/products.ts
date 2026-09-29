import type { Product } from "../types/product";
import topAliceImg from "../assets/top-alice.jpeg";
import shortsPietraImg from "../assets/shorts-pietra.jpeg";
import macaquinhoPaolaImg from "../assets/macaquinho-paola.jpeg";
import croppedSaraImg from "../assets/cropped-sara.jpeg";
import croppedJessicaImg from "../assets/cropped-manga-jessica.jpeg";
import croppedGrazyImg from "../assets/cropped-grazy.jpeg";

// Simulação dos dados da lista de produtos simulada
export const PRODUCTS: Product[] = [
  {
    id: "top-alice",
    name: "Top Alice",
    price: 189.9,
    oldPrice: 239.9,
    category: "Top",
    badge: { label: "Promoção", tone: "promo" },
    colors: ["#3a1116", "#c46b7e", "#e76ea3", "#f2b9c9"],
    sizes: ["P", "M", "G", "GG"],
    image: topAliceImg,
  },
  {
    id: "shorts-pietra",
    name: "Shorts Pietra",
    price: 129.9,
    category: "Shorts",
    badge: { label: "Pouco Estoque", tone: "estoque" },
    colors: ["#3a1116", "#8b1538", "#e0399c", "#e76ea3"],
    sizes: ["P", "M", "G"],
    image: shortsPietraImg,
    soldOut: true,
  },
  {
    id: "macaquinho-paola",
    name: "Macaquinho Paola",
    price: 219.9,
    category: "Macaquinho",
    badge: { label: "Novo", tone: "novo" },
    colors: ["#111111", "#8b1538", "#e0399c", "#f2b9c9"],
    sizes: ["P", "M", "G", "GG"],
    image: macaquinhoPaolaImg ,
  },
  {
    id: "cropped-sara",
    name: "Cropped Sara",
    price: 159.9,
    category: "Cropped",
    colors: ["#111111", "#c46b7e", "#e76ea3", "#f6d4de"],
    sizes: ["P", "M", "G", "GG"],
    image: croppedSaraImg,
    soldOut: true,
  },
  {
    id: "cropped-manga-jessica",
    name: "Cropped Manga Longa Jessica",
    price: 149.9,
    category: "Cropped",
    badge: { label: "Mais Vendido", tone: "vendido" },
    colors: ["#111111", "#8b1538", "#e0399c", "#f2b9c9"],
    sizes: ["34", "36", "38", "40", "42"],
    image: croppedJessicaImg,
  },
  {
    id: "cropped-grazy",
    name: "Cropped Grazy",
    price: 99.9,
    oldPrice: 119.9,
    category: "Cropped",
    badge: { label: "Promoção", tone: "promo" },
    colors: ["#111111", "#8b1538", "#e0399c", "#f2b9c9"],
    sizes: ["P", "M", "G"],
    image: croppedGrazyImg ,
  },
];
