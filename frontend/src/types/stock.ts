// Categoria do produto no estoque 
export type StockCategory = "Fitness";

// Uma linha da tabela de estoque: uma variação (cor/tamanho) de um produto
export type StockItem = {
  sku: string; 
  product: string;
  variation: string; 
  category: StockCategory;
  price: number;
  stock: number; 
};
