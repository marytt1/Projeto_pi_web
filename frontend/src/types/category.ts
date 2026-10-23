import type { ProductCategory } from "./product";

// Cada card da seção "Compre por Categorias"
export type CategoryItem = {
  id: string;
  label: string;
  image: string;
  filter?: ProductCategory;
};
