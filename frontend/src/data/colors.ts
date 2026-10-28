// Os produtos guardam as cores em hexadecimal, mas o carrinho e os favoritos mostram o nome da cor ou o próprio hexadecimal
export const COLOR_NAMES: Record<string, string> = {
  "#111111": "Preto",
  "#3a1116": "Vinho escuro",
  "#8b1538": "Vinho",
  "#c46b7e": "Rosê",
  "#e76ea3": "Rosa",
  "#e0399c": "Pink",
  "#f2b9c9": "Rosa claro",
  "#f6d4de": "Rosa claro",
};

export function getColorName(hex: string) {
  return COLOR_NAMES[hex] ?? hex;
}

// Código curto da cor, usado no SKU do estoque
const COLOR_CODES: Record<string, string> = {
  "#111111": "PRT",
  "#3a1116": "VED",
  "#8b1538": "VIN",
  "#c46b7e": "RSE",
  "#e76ea3": "ROS",
  "#e0399c": "PNK",
  "#f2b9c9": "RCL",
  "#f6d4de": "RCL",
};

export function getColorCode(hex: string) {
  return COLOR_CODES[hex] ?? hex.replace("#", "").slice(0, 3).toUpperCase();
}