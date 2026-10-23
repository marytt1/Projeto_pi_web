// Uma linha da tabela de referência de tamanhos
export type SizeRow = {
  size: string;
  bust: string;
  waist: string;
  hip: string;
  bustRange: [number, number];
  waistRange: [number, number];
  hipRange: [number, number];
};

// Resultado do "Calcular Meu Tamanho"
export type SizeResult =
  | {
      status: "ok";
      size: string; 
      details: { label: string; value: number; size: string }[]; 
      mixed: boolean; 
    }
  | { status: "above" }; 