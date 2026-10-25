import { Search, X } from "lucide-react";

interface SearchInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
}: SearchInputProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900 px-4 py-3 shadow-sm transition-colors focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-500/20 ${className}`}
    >
      <Search
        size={19}
        className="shrink-0 text-slate-400"
        aria-hidden="true"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
          className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
