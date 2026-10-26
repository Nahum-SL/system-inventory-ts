export const ACCIONES_STYLES = {
  VER: [
    "border-blue-200 bg-blue-50 text-blue-700",
    "hover:bg-blue-100",
    "dark:border-blue-900/70 dark:bg-blue-950/40",
    "dark:text-blue-300 dark:hover:bg-blue-900/50",
  ].join(" "),

  EDITAR: [
    "border-emerald-200 bg-emerald-50 text-emerald-700",
    "hover:bg-emerald-100",
    "dark:border-emerald-900/70 dark:bg-emerald-950/40",
    "dark:text-emerald-300 dark:hover:bg-emerald-900/50",
  ].join(" "),

  ELIMINAR: [
    "border-red-200 bg-red-50 text-red-700",
    "hover:bg-red-100",
    "dark:border-red-900/70 dark:bg-red-950/40",
    "dark:text-red-300 dark:hover:bg-red-900/50",
  ].join(" "),

  DEFAULT: [
    "border-slate-200 bg-slate-50 text-slate-700",
    "hover:bg-slate-100",
    "dark:border-gray-700 dark:bg-gray-800",
    "dark:text-slate-200 dark:hover:bg-gray-700",
  ].join(" "),
} as const;

export type AccionesType = keyof typeof ACCIONES_STYLES;

// shared/lib/themes/status-theme.ts

export const STATUS_STYLES = {
  OPERATIVO:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900",

  MANTENIMIENTO:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",

  INOPERATIVO:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",

  DEFAULT:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
} as const;

export type StatusType = keyof typeof STATUS_STYLES;
