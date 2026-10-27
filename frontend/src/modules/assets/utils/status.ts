import type { AssetStatus } from "../types";

export const STATUS_LABELS: Record<AssetStatus, string> = {
  operativo: "Operativo",
  mantenimiento: "En mantenimiento",
  fuera_de_servicio: "Fuera de servicio",
};

export const STATUS_STYLES: Record<AssetStatus, string> = {
  operativo:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-400",

  mantenimiento:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-400",

  fuera_de_servicio:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400",
};
