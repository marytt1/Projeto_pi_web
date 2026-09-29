import type { CategoryItem } from "../types/category";
import topAliceImg from "../assets/top-alice.jpeg";
import shortsPietraImg from "../assets/shorts-pietra.jpeg";
import macaquinhoPaolaImg from "../assets/macaquinho-paola.jpeg";
import leggingEloaImg from "../assets/legging-eloa.jpeg";
import croppedGrazyImg from "../assets/cropped-grazy.jpeg";

// Principais Categorias 
export const CATEGORIES: CategoryItem[] = [
  { id: "tops", label: "Tops", image: topAliceImg },
  { id: "croppeds", label: "Croppeds", image: croppedGrazyImg },
  { id: "shorts", label: "Shorts", image: shortsPietraImg },
  { id: "macacoes", label: "Macacões", image: macaquinhoPaolaImg },
  { id: "leggings", label: "Leggings", image: leggingEloaImg},
];
