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
