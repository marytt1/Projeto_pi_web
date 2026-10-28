import { PRODUCTS } from "./products";
import { getColorName, getColorCode } from "./colors";
import type { StockItem } from "../types/stock";

// Simulação do estoque que é gerado a partir dos produtos da loja: uma linha para cada combinação de produto + cor + tamanho
function buildStock(): StockItem[] {
  const rows: StockItem[] = [];
  let counter = 0;

  PRODUCTS.forEach((product, productIndex) => {
    const productCode = `P${String(productIndex + 1).padStart(2, "0")}`; // P01, P02...

    product.colors.forEach((color) => {
      product.sizes.forEach((size) => {
        // Quantidades de exemplo variadas, com algumas baixas e produtos marcados como esgotados na vitrine começam com 0
        const quantity = product.soldOut
          ? 0
          : counter % 17 === 5
          ? 0
          : counter % 13 === 4
          ? 2
          : 4 + ((counter * 7) % 9);

        rows.push({
          sku: `${productCode}-${getColorCode(color)}-${size}`,
          productId: product.id,
          product: product.name,
          variation: `${getColorName(color)} / ${size}`,
          category: "Fitness",
          price: product.price,
          stock: quantity,
        });
        counter++;
      });
    });
  });

  return rows;
}

export const STOCK: StockItem[] = buildStock();
