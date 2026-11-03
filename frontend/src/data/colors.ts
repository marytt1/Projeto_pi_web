// Os produtos guardam as cores em hexadecimal, mas o carrinho e os favoritos mostram o nome da cor ou o próprio hexadecimal
export const COLOR_NAMES: Record<string, string> = {
  "#111111": "Preto",
  "#3a1116": "Vinho",
  "#8b1538": "Borgonha",
  "#c46b7e": "Rosê",
  "#e76ea3": "Rosa",
  "#e0399c": "Pink",
  "#f2b9c9": "Rosa Claro",
  "#f6d4de": "Rosa Claro",
};


export function getColorName(hex: string) {
  return COLOR_NAMES[hex] ?? hex;
}
