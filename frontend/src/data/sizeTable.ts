import type { SizeRow } from "../types/size";

// Tabela de referência exibida no Guia de Tamanhos (medidas em cm)
export const SIZE_TABLE: SizeRow[] = [
  { size: "P", bust: "78–84", waist: "58–64", hip: "85–91", bustRange: [78, 84], waistRange: [58, 64], hipRange: [85, 91] },
  { size: "M", bust: "84–90", waist: "64–70", hip: "91–97", bustRange: [84, 90], waistRange: [64, 70], hipRange: [91, 97] },
  { size: "G", bust: "90–96", waist: "70–76", hip: "97–103", bustRange: [90, 96], waistRange: [70, 76], hipRange: [97, 103] },
  { size: "GG", bust: "96–104", waist: "76–84", hip: "103–111", bustRange: [96, 104], waistRange: [76, 84], hipRange: [103, 111] },
];