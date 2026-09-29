import type { StockItem } from "../types/stock";

// Simulação dos dados de estoque exibido no Dashboard Administrativo (Estoque)
export const STOCK: StockItem[] = [
  { sku: "P01-BRD-M", product: "Macaquinho Paola", variation: "Borgonha / M", category: "Fitness", price: 219.9, stock: 3 },
  { sku: "P01-PRT-G", product: "Shorts Pietra", variation: "Preto / G", category: "Fitness", price: 129.9, stock: 0 },
  { sku: "P02-BRD-P", product: "Cropped Grazy", variation: "Borgonha / P", category: "Fitness", price: 99.9, stock: 3 },
  { sku: "P03-CRM-G", product: "Top Alice", variation: "Pink / G", category: "Fitness", price: 189.9, stock: 8 },
  { sku: "P04-PRT-M", product: "Macaquinho Karol", variation: "Preto / M", category: "Fitness", price: 159.9, stock: 0 },
  { sku: "P05-RSE-38", product: "Top Camila", variation: "Pink / 38", category: "Fitness", price: 149.9, stock: 12 },
  { sku: "P06-BRD-M", product: "Top Jessica Manga Curta", variation: "Preto / M", category: "Fitness", price: 99.9, stock: 6 },
];
