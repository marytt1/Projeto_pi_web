import type { LucideIcon } from "lucide-react";

// Cada card da seção "O Padrão La Rose" com o ícone sendo um próprio componente da lib lucide-react: LucideIcon
export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  text: string;
};
