// Categorias possíveis de um produto
export type ProductCategory = "Top" | "Shorts" | "Macaquinho" | "Cropped";

// Cor/estilo visual de cada selo (badge) que aparece no card do produto
export type ProductBadgeTone = "promo" | "estoque" | "novo" | "vendido";

// Selo exibido no canto do card
export type ProductBadge = {
  label: string;
  tone: ProductBadgeTone;
};

// Formato de um produto da vitrine
export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number; 
  category: ProductCategory;
  badge?: ProductBadge;
  colors: string[]; 
  sizes: string[]; 
  image: string; 
  soldOut?: boolean;
};
