import type { AssetStatus } from "../types";

export const STATUS_LABELS: Record<AssetStatus, string> = {
  operativo: "Operativo",
  mantenimiento: "En mantenimiento",
  fuera_de_servicio: "Fuera de servicio",
};

export const STATUS_STYLES: Record<AssetStatus, string> = {
  operativo: "bg-green-100 text-green-800",
  mantenimiento: "bg-amber-100 text-amber-800",
  fuera_de_servicio: "bg-red-100 text-red-800",
};
