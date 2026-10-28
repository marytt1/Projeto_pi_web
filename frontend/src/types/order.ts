// Status possíveis de um pedido, na ordem do fluxo de venda
export type OrderStatus = "Aguardando" | "Confirmado" | "Enviado" | "Entregue";

// Uma peça dentro do pedido 
export type OrderItem = {
  productId: string; 
  name: string;
  image: string;
  size: string;
  colorName: string;
  quantity: number;
  price: number; 
};

// Um pedido feito por um cliente
export type Order = {
  id: string;
  customerName: string;
  customerEmail: string; 
  items: OrderItem[];
  total: number;
  date: string; 
  status: OrderStatus;
  stockDeducted?: boolean; 
};
