export const MAX_IMAGE_MB = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Devolve a mensagem de erro, ou null se o arquivo é válido
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Formato inválido. Use uma imagem JPG, PNG ou WebP.";
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `A imagem deve ter no máximo ${MAX_IMAGE_MB} MB.`;
  return null;
}

// Endereço temporário para mostrar a imagem escolhida antes de enviar
export const makePreview = (file: File) => URL.createObjectURL(file);

// Libera a memória do endereço temporário
export function revokePreview(url: string | null) {
  if (url) URL.revokeObjectURL(url);
}
