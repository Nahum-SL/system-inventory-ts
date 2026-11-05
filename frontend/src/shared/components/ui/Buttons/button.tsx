import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "danger-outline";

const VARIANTS: Record<Variant, string> = {
  primary: cn(
    "border border-transparent bg-amber-600 text-white",
    "hover:bg-amber-700",
    "dark:bg-amber-500 dark:text-gray-950 dark:hover:bg-amber-400",
  ),

  secondary: cn(
    "border border-slate-200 bg-white text-slate-700",
    "hover:border-slate-300 hover:bg-slate-50",
    "dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200",
    "dark:hover:border-gray-600 dark:hover:bg-gray-800",
  ),

  danger: cn(
    "border border-red-200 bg-red-600 text-white",
    "hover:bg-red-700",
    "dark:border-red-900/70 dark:bg-red-700 dark:hover:bg-red-600",
  ),

  "danger-outline": cn(
    "border border-red-200 bg-transparent text-red-600",
    "hover:bg-red-100",
    "dark:border-red-900/70 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30",
  ),
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2",
        "rounded-xl border px-4 py-2 text-sm font-medium",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-amber-500 focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-gray-900",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "disabled:hover:bg-inherit",
        "cursor-pointer",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {loading && (
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      )}

      {loading ? "Procesando…" : children}
    </button>
  );
}
