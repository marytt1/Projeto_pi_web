import type { CartItem } from "../types/cart";
import shortsPietraImg from "../assets/shorts-pietra.jpeg";
import macaquinhoPaolaImg from "../assets/macaquinho-paola.jpeg";
import croppedJessicaImg from "../assets/cropped-manga-jessica.jpeg";

// Carrinho simulado (estado inicial)
export const INITIAL_CART: CartItem[] = [
  {
    id: "cropped-manga-jessica",
    name: "Cropped Manga Longa Jessica",
    image: croppedJessicaImg ,
    size: "G",
    colorName: "Preto",
    price: 149.9,
    quantity: 1,
  },
  {
    id: "macaquinho-paola",
    name: "Macaquinho Paola",
    image: macaquinhoPaolaImg,
    size: "G",
    colorName: "Preto",
    price: 229.9,
    quantity: 1,
  },
  {
    id: "shorts-pietra",
    name: "Shorts Pietra",
    image: shortsPietraImg,
    size: "G",
    colorName: "Pink",
    price: 129.9,
    quantity: 1,
  },
];
