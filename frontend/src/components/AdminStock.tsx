import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import AdminTopBar from "./AdminTopBar";
import { STOCK } from "../data/stock";
import type { StockItem } from "../types/stock";


function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


// Componente que gerencia o inventário com busca de produtos, remoção e edição inline da quantidade em estoque
export default function AdminStock() {
  const [stock, setStock] = useState<StockItem[]>(STOCK);
  const [search, setSearch] = useState("");


  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");


  function startEditing(item: StockItem) {
    setEditingSku(item.sku);
    setDraftValue(String(item.stock));
  }


  function cancelEditing() {
    setEditingSku(null);
    setDraftValue("");
  }


  function saveEditing(sku: string) {
    const newStock = Number(draftValue);
    if (Number.isNaN(newStock) || newStock < 0) return; // validação simples


    setStock((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, stock: newStock } : item))
    );
    cancelEditing();
  }


  function removeItem(sku: string) {
    setStock((prev) => prev.filter((item) => item.sku !== sku));
  }


  const filteredStock = stock.filter((item) =>
    item.product.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div>
      <AdminTopBar title="Estoque" />


      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50">
          <h3 className="font-medium">Gestão de Estoque</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5 w-56">
              <Search size={14} className="text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar produto.."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm outline-none w-full placeholder:text-neutral-400"
              />
            </div>
            <button className="flex items-center gap-1.5 bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap">
              <Plus size={14} />
              Novo Produto
            </button>
          </div>
        </div>


        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400 text-xs border-b border-neutral-100">
              <th className="px-6 py-3 font-normal">SKU</th>
              <th className="px-6 py-3 font-normal">Produto</th>
              <th className="px-6 py-3 font-normal">Variação</th>
              <th className="px-6 py-3 font-normal">Categoria</th>
              <th className="px-6 py-3 font-normal">Preço</th>
              <th className="px-6 py-3 font-normal">Estoque</th>
              <th className="px-6 py-3 font-normal">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.map((item) => {
              const isEditing = editingSku === item.sku;


              return (
                <tr key={item.sku} className="border-b border-neutral-50 last:border-0">
                  <td className="px-6 py-4 text-neutral-400">{item.sku}</td>
                  <td className="px-6 py-4 font-medium">{item.product}</td>
                  <td className="px-6 py-4 text-neutral-500">{item.variation}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatPrice(item.price)}</td>
                 
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        className="w-16 border border-neutral-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#8b1538]"
                        autoFocus
                      />
                    ) : item.stock === 0 ? (
                      <span className="flex items-center gap-2">
                        <span className="text-red-500 font-medium">0</span>
                        <span className="text-[10px] bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded-full">
                          ESGOTADO
                        </span>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">{item.stock}</span>
                    )}
                  </td>
                 
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEditing(item.sku)}
                          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-full"
                        >
                          <Check size={12} />
                          Salvar
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center gap-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors text-xs font-medium px-3 py-1.5 rounded-full"
                        >
                          <X size={12} />
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEditing(item)}
                          aria-label="Editar"
                          className="text-[#8b1538] hover:text-[#71102d]"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => removeItem(item.sku)}
                          aria-label="Excluir"
                          className="text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


