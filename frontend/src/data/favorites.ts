import type { FavoriteItem } from "../types/favorite";
import croppedJessicaImg from "../assets/cropped-manga-jessica.jpeg";

// Favoritos simulados (estado inicial)
export const INITIAL_FAVORITES: FavoriteItem[] = [
  {
    id: "cropped-manga-jessica",
    name: "Cropped Manga Longa Jessica",
    image: croppedJessicaImg,
    size: "G",
    colorName: "Preto",
    price: 149.9,
  },
];
