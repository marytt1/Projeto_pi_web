const STORE_WHATSAPP_NUMBER = "5519994416895";

// Links externos da loja, o rodapé e a seção do grupo VIP usam estas constantes
export const STORE_LINKS = {
  vipGroup: "https://chat.whatsapp.com/HJUlFTUDwVOFvJ7Kebm9U5?s=cl&p=a&mlu=4&ilr=4",
  
  instagram: "https://www.instagram.com/larose_modaintima",
  
  whatsapp: `https://wa.me/${STORE_WHATSAPP_NUMBER}`
};

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}