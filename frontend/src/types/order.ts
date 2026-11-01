export type OrderStatus = "Aguardando" | "Confirmado" | "Enviado" | "Entregue" | "Cancelado";

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
  id: string; // código exibido, ex.: "ORD-001"
  apiId?: number; 
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: OrderStatus;
  stockDeducted?: boolean;
};
