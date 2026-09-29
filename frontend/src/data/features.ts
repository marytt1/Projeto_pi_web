import { Thermometer, PenTool, ShieldCheck, Gauge } from "lucide-react";
import type { FeatureItem } from "../types/feature";

// Dados simulados da seção "O padrão La Rose"
export const FEATURES: FeatureItem[] = [
  {
    icon: Thermometer,
    title: "Tecnologia & Performance",
    text: "Fios inteligentes com respirabilidade térmica ativa e acabamento sedoso ao toque.",
  },
  {
    icon: PenTool,
    title: "Design Exclusivo",
    text: "Modelagens ergonômicas desenhadas especificamente para valorizar e acompanhar a silhueta natural.",
  },
  {
    icon: ShieldCheck,
    title: "Conforto Incomparável",
    text: "Construção seamless sem costuras aparentes e elastano de rápida recuperação que não alarga.",
  },
  {
    icon: Gauge,
    title: "Alta Durabilidade",
    text: "Testado em treinos de alta intensidade com retenção impecável de cor e estrutura após lavagem.",
  },
];
