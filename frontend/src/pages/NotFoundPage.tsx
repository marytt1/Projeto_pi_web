import { Link } from "react-router";

// Página exibida quando é digitado um endereço que não existe (path="*")
export default function NotFoundPage() {
  return (
    <div className="px-6 py-24 text-center">
      <h1 className="font-serif text-4xl text-[#8b1538]">Página não encontrada</h1>
      <p className="text-sm text-neutral-500 mt-3">
        O endereço que você tentou acessar não existe.
      </p>
      <Link
        to="/"
        className="inline-block mt-6 bg-[#8b1538] hover:bg-[#71102d] transition-colors text-white text-sm font-medium px-6 py-3 rounded-full"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
