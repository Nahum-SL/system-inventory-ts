import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

import { controlClass } from "@/shared/components/ui/Buttons/style.button";
import { cn } from "@/shared/lib/utils";

export interface SearchSelectOption {
  value: string;
  label: string;
  /** Texto secundario (también cuenta para la búsqueda). */
  hint?: string;
}

interface Props {
  options: SearchSelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Si viene, la lista no se pudo cargar y el campo queda deshabilitado. */
  errorMessage?: string;
  invalid?: boolean;
  id?: string;
}

interface Layout {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
  container: HTMLElement;
}

const GAP = 4;
const MAX_HEIGHT = 256;

/** Sin tildes ni mayúsculas: "quispe huaman" encuentra "Quispe Huamán". */
const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export default function SearchSelect({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Selecciona…",
  disabled,
  loading,
  errorMessage,
  invalid,
  id,
}: Props) {
  const uid = useId();
  const listId = `${uid}-list`;
  const optionId = (index: number) => `${uid}-opt-${index}`;

  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Solo el teclado hace scroll hacia la opción activa; el ratón no.
  const keyboardNav = useRef(false);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [layout, setLayout] = useState<Layout | null>(null);

  const inactive = Boolean(disabled || loading || errorMessage);
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return options;

    return options.filter((o) => {
      const haystack = normalize(`${o.label} ${o.hint ?? ""}`);
      return terms.every((term) => haystack.includes(term));
    });
  }, [options, query]);

  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;

    const rect = box.getBoundingClientRect();
    const viewportH = document.documentElement.clientHeight;
    const below = viewportH - rect.bottom - GAP - 8;
    const above = rect.top - GAP - 8;
    const flip = below < 180 && above > below;

    setLayout({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(120, Math.min(MAX_HEIGHT, flip ? above : below)),
      top: flip ? undefined : rect.bottom + GAP,
      bottom: flip ? viewportH - rect.top + GAP : undefined,
      // Dentro de un <dialog> modal la lista debe vivir en el propio <dialog>:
      // lo que cuelga de <body> queda detrás y no recibe clics.
      container: box.closest("dialog") ?? document.body,
    });
  }, []);

  // Reposiciona la lista si cambia el tamaño de la ventana o algo hace scroll.
  useEffect(() => {
    if (!open) return;

    const onScroll = (event: Event) => {
      if (listRef.current?.contains(event.target as Node)) return;
      measure();
    };

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, measure]);

  // Mantiene visible la opción activa al navegar con el teclado.
  useEffect(() => {
    if (!open || !keyboardNav.current) return;

    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active, layout]);

  const openList = () => {
    if (open || inactive) return;

    measure();
    setQuery("");
    keyboardNav.current = true;
    // Con la búsqueda vacía `filtered` es toda la lista: se resalta la opción actual.
    setActive(
      Math.max(
        options.findIndex((o) => o.value === value),
        0,
      ),
    );
    setOpen(true);
  };

  const closeList = () => {
    setOpen(false);
    setQuery("");
  };

  const commit = (option: SearchSelectOption) => {
    onChange(option.value);
    closeList();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          openList();
          return;
        }
        if (filtered.length === 0) return;

        const step = event.key === "ArrowDown" ? 1 : -1;
        keyboardNav.current = true;
        setActive((i) => (i + step + filtered.length) % filtered.length);
        return;
      }
      case "Enter": {
        // Con la lista abierta, Enter elige; nunca envía el formulario.
        if (!open) return;
        event.preventDefault();
        const option = filtered[active];
        if (option) commit(option);
        return;
      }
      case "Escape": {
        // Cierra solo la lista; sin esto el <dialog> se cerraría también.
        if (!open) return;
        event.preventDefault();
        closeList();
        return;
      }
    }
  };

  const hint = loading
    ? "Cargando…"
    : (errorMessage ?? (open && selected ? selected.label : placeholder));

  return (
    <div ref={boxRef} className="relative mt-1">
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[active] ? optionId(active) : undefined
        }
        aria-invalid={invalid || undefined}
        disabled={inactive}
        placeholder={hint}
        value={open ? query : (selected?.label ?? "")}
        className={cn(controlClass, "mt-0 pr-9 text-ellipsis")}
        onFocus={(event) => event.currentTarget.select()}
        onClick={openList}
        onChange={(event) => {
          if (!open) openList();
          setQuery(event.target.value);
          keyboardNav.current = true;
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => {
          closeList();
          onBlur?.();
        }}
      />

      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
      />

      {open &&
        layout &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            // Evita que el campo pierda el foco (y cierre la lista) al hacer clic.
            onMouseDown={(event) => event.preventDefault()}
            style={{
              left: layout.left,
              width: layout.width,
              top: layout.top,
              bottom: layout.bottom,
              maxHeight: layout.maxHeight,
            }}
            className={cn(
              "fixed z-50 overflow-y-auto rounded-xl border p-1 text-sm font-normal shadow-lg",
              "border-slate-200 bg-white text-slate-800",
              "dark:border-gray-700 dark:bg-gray-900 dark:text-slate-100",
            )}
          >
            {filtered.length === 0 ? (
              <li
                role="presentation"
                className="px-3 py-2 text-slate-500 dark:text-slate-400"
              >
                Sin resultados
              </li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={option.value === value}
                  data-active={index === active}
                  onMouseEnter={() => {
                    keyboardNav.current = false;
                    setActive(index);
                  }}
                  onClick={() => commit(option)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2",
                    index === active && "bg-amber-50 dark:bg-amber-950/40",
                    option.value === value && "font-medium",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block wrap-break-word">
                      {option.label}
                    </span>
                    {option.hint && (
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {option.hint}
                      </span>
                    )}
                  </span>
                  {option.value === value && (
                    <Check size={16} aria-hidden="true" className="shrink-0" />
                  )}
                </li>
              ))
            )}
          </ul>,
          layout.container,
        )}
    </div>
  );
}
