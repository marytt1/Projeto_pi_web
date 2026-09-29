import { MessageCircle } from "lucide-react";
import InstagramIcon from "./icons/InstagramIcon";

// Componente do Rodapé do site com informações da marca, links de navegação, endereço físico e redes sociais
export default function Footer() {
  return (
    <footer className="bg-[#1c1c1c] text-white/80 px-6 md:px-10 py-14">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <div>
          <h2 className="font-serif italic text-2xl text-white mb-3">
            La Rose
          </h2>
          <p className="text-sm text-white/50 max-w-xs">
            Moda íntima e fitness wear com elegância em Santa Cruz das
            Palmeiras – SP.
          </p>
        </div>

        <div>
          <h3 className="text-xs tracking-widest uppercase text-white/40 mb-4">
            Coleções
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Catálogo
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Provador
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Novidades
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs tracking-widest uppercase text-white/40 mb-4">
            Atendimento Presencial
          </h3>
          <p className="text-sm text-white/70 leading-relaxed">
            R. Cel. Penteado, 586 – Centro,
            <br />
            Santa Cruz das Palmeiras – SP,
            <br />
            13650-000
          </p>
          <div className="flex gap-3 mt-4">
            <a
              href="#"
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-full bg-[#25D366]/90 flex items-center justify-center hover:opacity-90"
            >
              <MessageCircle size={16} className="text-white" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#e0399c] to-[#8b1538] flex items-center justify-center hover:opacity-90"
            >
              <InstagramIcon size={16} className="text-white" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-6 text-xs text-white/40 text-center">
        © {new Date().getFullYear()} La Rose. Todos os direitos reservados.
      </div>
    </footer>
  );
}
