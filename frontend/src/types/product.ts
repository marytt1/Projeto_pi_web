// Categorias possíveis de um produto
export type ProductCategory = string;

// Cor/estilo visual de cada selo (badge) que aparece no card do produto
export type ProductBadgeTone = "promo" | "estoque" | "novo" | "vendido";

// Selo exibido no canto do card
export type ProductBadge = {
  label: string;
  tone: ProductBadgeTone;
};

// uma variação real do banco (cor + tamanho). O carrinho precisa do id dela.
export type ProductVariant = {
  id: string; // id da variação na API (vira o variantId do carrinho)
  size: string;
  colorName: string;
  stock: number;
};

// cor com nome (usado no carrinho) e código hex (usado na bolinha do card)
export type ColorOption = {
  name: string;
  hex: string;
};

// Foto da galeria de um produto (colorName null = foto geral)
export type ProductImageItem = {
  id: string;
  url: string;
  colorName: string | null;
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
  description?: string;
  variants?: ProductVariant[];
  images?: ProductImageItem[];  
};
