import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

// Componente do campo de senha com o botão de mostrar/esconder
export default function PasswordField({ value, onChange, placeholder }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 pr-10 text-sm outline-none focus:border-[#8b1538]"
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
        aria-label="Mostrar senha"
      >
        {show ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    </div>
  );
}