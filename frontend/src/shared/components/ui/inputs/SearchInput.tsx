import { Search, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface SearchInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  id,
  value,
  onChange,
  placeholder = "Buscar...",
  className,
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm",
        "border-slate-300 bg-white transition-colors",
        "focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20",
        "dark:border-gray-700 dark:bg-gray-900",
        "dark:focus-within:border-amber-500 dark:focus-within:ring-amber-500/20",
        className,
      )}
    >
      <Search
        size={19}
        className="shrink-0 text-slate-400 dark:text-slate-500"
        aria-hidden="true"
      />

      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Buscar"
        className={cn(
          "min-w-0 flex-1 bg-transparent text-sm outline-none",
          "text-slate-900 placeholder:text-slate-400",
          "dark:text-slate-100 dark:placeholder:text-slate-500",
        )}
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
          className={cn(
            "shrink-0 rounded-lg p-1 transition-colors",
            "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
            "dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-amber-500",
          )}
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
