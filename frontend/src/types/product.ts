// Categorias possíveis de um produto
export type ProductCategory = "Top" | "Shorts" | "Macaquinho" | "Cropped";

// Cor/estilo visual de cada selo (badge) que aparece no card do produto
export type ProductBadgeTone = "promo" | "estoque" | "novo" | "vendido";

// Selo exibido no canto do card
export type ProductBadge = {
  label: string;
  tone: ProductBadgeTone;
};

export type ProductVariant = {
  id: string; 
  size: string;
  colorName: string;
  stock: number;
};

export type ColorOption = {
  name: string;
  hex: string;
};

// Formato de um produto da vitrine
export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: ProductCategory;
  badge?: ProductBadge;
  colors: string[]; // códigos hex das cores (continua igual)
  sizes: string[];
  image: string;
  soldOut?: boolean;
  colorOptions?: ColorOption[]; 
  variants?: ProductVariant[];  
};
