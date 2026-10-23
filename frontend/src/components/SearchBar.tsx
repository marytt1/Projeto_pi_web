import { useState } from "react";
import type { FormEvent } from "react";
import { Search } from "lucide-react";

// Componente do campo de busca reutilizável
type SearchBarProps = {
  onSearch: (term: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  onSearch,
  placeholder = "Buscar peças...",
  className = "",
}: SearchBarProps) {
  const [term, setTerm] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault(); 
    onSearch(term.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`items-center gap-2 border border-neutral-200 rounded-full px-4 py-2 ${className}`}
    >
      <button type="submit" aria-label="Buscar" className="text-neutral-400 hover:text-[#8b1538]">
        <Search size={16} />
      </button>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="text-sm outline-none w-full placeholder:text-neutral-400"
      />
    </form>
  );
}