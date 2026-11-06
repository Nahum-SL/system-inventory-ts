import { cn } from "../utils";

export const ACCIONES_STYLES = {
  VER: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-900/40",

  EDITAR:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900 dark:hover:bg-emerald-900/40",

  ELIMINAR:
    "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/40",

  DEFAULT:
    "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700",
} as const;

export type AccionesType = keyof typeof ACCIONES_STYLES;

export type ActionTone = "primary" | "neutral" | "danger";

// ==========================
// TILE & ICON_BOX
// ==========================

export const TILE: Record<ActionTone, string> = {
  primary: cn(
    "border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100",
    "dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-950/50",
  ),
  neutral: cn(
    "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    "dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 dark:hover:bg-gray-800",
  ),
  danger: cn(
    "border-red-200 bg-white text-red-700 hover:bg-red-50",
    "dark:border-red-900/60 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/30",
  ),
};

export const ICON_BOX: Record<ActionTone, string> = {
  primary:
    "bg-amber-200/70 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  neutral: "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

export const CHIP_STYLES = {
  base: "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
  on: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",
  off: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-300 dark:hover:bg-gray-800",
} as const;