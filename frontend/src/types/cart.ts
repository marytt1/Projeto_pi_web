// Um item dentro do carrinho: um produto + a variação (cor/tamanho) escolhida + a quantidade
export type CartItem = {
  id: string; 
  productId: string;
  name: string;
  image: string;
  size: string;
  colorName: string;
  price: number;
  quantity: number;
  available?: number; // NOVO: estoque disponível
  status?: "ok" | "quantity_adjusted" | "out_of_stock"; 
};
