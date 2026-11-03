import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number; // página atual (começa em 1)
  pageSize: number;
  total: number; // total de itens (depois de aplicar a busca)
  onChange: (page: number) => void;
};

const ARROW_CLASS =
  "w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed";

// Setinhas para navegar entre as páginas de uma tabela. Some quando tudo cabe em uma página só.
export default function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  if (total <= pageSize) return null;

  const pageCount = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100 text-xs text-neutral-500">
      <span>
        Mostrando {start}–{end} de {total}
      </span>

      <div className="flex items-center gap-3">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Página anterior" className={ARROW_CLASS}>
          <ChevronLeft size={16} />
        </button>
        <span>
          Página {page} de {pageCount}
        </span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Próxima página"
          className={ARROW_CLASS}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
