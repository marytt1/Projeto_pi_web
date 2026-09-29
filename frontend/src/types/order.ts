// Status possíveis de um pedido, na ordem do fluxo de venda
export type OrderStatus = "Aguardando" | "Confirmado" | "Enviado" | "Entregue";

// Um pedido feito por um cliente (visto no Dashboard Administrativo)
export type Order = {
  id: string; 
  customerName: string;
  customerPhone: string;
  items: string; 
  total: number;
  date: string; 
  status: OrderStatus;
};
