import type { ReactNode } from "react";

type SectionProps = {
  id?: string; 
  eyebrow?: string; 
  title: string;
  description?: string;
  align?: "center" | "start"; 
  headerActions?: ReactNode; 
  className?: string;
  children: ReactNode;
};

// Componente de seção reutilizável com estrutura parametrizável para cabeçalhos, títulos, alinhamento e conteúdo filho
export default function Section({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  headerActions,
  className = "",
  children,
}: SectionProps) {
  const isStart = align === "start";

  return (
    <section id={id} className={`px-6 md:px-10 py-16 ${className}`}>
      <div
        className={`mb-10 ${
          isStart
            ? "flex flex-col md:flex-row md:items-end md:justify-between gap-6"
            : "text-center"
        }`}
      >
        <div>
          {eyebrow && (
            <p className="text-xs tracking-widest uppercase text-[#8b1538] mb-2">
              {eyebrow}
            </p>
          )}
          <h2 className="font-serif text-3xl md:text-4xl text-[#3a3a3a]">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-neutral-500 mt-3 max-w-md mx-auto">
              {description}
            </p>
          )}
        </div>

        {headerActions}
      </div>

      {children}
    </section>
  );
}
