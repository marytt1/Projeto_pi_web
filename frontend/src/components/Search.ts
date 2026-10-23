// Função para retirar acentos e deixar tudo minúsculo
export function normalizeText(text: string) {
  return text
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase()
    .trim();
}

// Função para dizer se o termo digitado aparece em algum dos campos informados
export function matchesSearch(term: string, ...fields: (string | number)[]) {
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) return true;

  return fields.some((field) => normalizeText(String(field)).includes(normalizedTerm));
}