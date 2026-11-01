export type StockCategory = string;

// Uma linha da tabela de estoque: uma variação (cor/tamanho) de um produto
export type StockItem = {
  sku: string;
  variantId?: number; 
  productId?: string;
  product: string;
  variation: string;
  category: StockCategory;
  price: number;
  stock: number;
};
