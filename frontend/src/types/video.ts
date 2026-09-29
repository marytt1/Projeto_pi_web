// Cada card de vídeo da seção "Descubra cada detalhe em vídeo"
export type VideoItem = {
  id: string;
  caption: string; 
  thumb: string; 
  productImage: string; 
  productName: string;
  price: number;
  oldPrice?: number;
};
