import { SIZE_TABLE } from "../data/sizeTable";
import type { SizeResult, SizeRow } from "../types/size";

// Descobre qual tamanho (posição na tabela) combina com uma medida
function findSizeIndex(value: number, range: keyof Pick<SizeRow, "bustRange" | "waistRange" | "hipRange">) {
  const lastIndex = SIZE_TABLE.length - 1;

  for (let i = 0; i < lastIndex; i++) {
    if (value < SIZE_TABLE[i][range][1]) return i;
  }

  return value <= SIZE_TABLE[lastIndex][range][1] ? lastIndex : -1;
}

// Função para calcular o tamanho recebe busto, cintura e quadril (em cm) e devolve o tamanho recomendado
export function calculateSize(bust: number, waist: number, hip: number): SizeResult {
  const indexes = [
    findSizeIndex(bust, "bustRange"),
    findSizeIndex(waist, "waistRange"),
    findSizeIndex(hip, "hipRange"),
  ];

  if (indexes.includes(-1)) return { status: "above" };

  const values = [bust, waist, hip];
  const labels = ["Busto", "Cintura", "Quadril"];

  return {
    status: "ok",
    size: SIZE_TABLE[Math.max(...indexes)].size,
    details: labels.map((label, i) => ({
      label,
      value: values[i],
      size: SIZE_TABLE[indexes[i]].size,
    })),
    mixed: new Set(indexes).size > 1,
  };
}