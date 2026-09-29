import type { OrderStatus } from "../types/order";

type StatusBadgeProps = {
  status: OrderStatus;
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  Aguardando: "bg-amber-50 text-amber-700",
  Confirmado: "bg-sky-50 text-sky-700",
  Enviado: "bg-violet-50 text-violet-700",
  Entregue: "bg-emerald-50 text-emerald-700",
};

// Componente de badge que estiliza e exibe o status de um pedido com cores dinâmicas
export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex text-xs font-medium px-3 py-1 rounded-full ${STATUS_CLASSES[status]}`}
    >
      {status}
    </span>
  );
}
