import type { AssetFilters, AssetStatus, AssignmentFilter } from "../types";
import { STATUS_LABELS } from "./status";

export const ASSET_STATUSES = Object.keys(STATUS_LABELS) as AssetStatus[];

export const ASSIGNMENT_LABELS: Record<AssignmentFilter, string> = {
  asignado: "Con responsable",
  libre: "Sin responsable",
};

const ASSIGNMENTS = Object.keys(ASSIGNMENT_LABELS) as AssignmentFilter[];

/** Lee los filtros de la URL; cualquier valor desconocido se ignora. */
export function parseSearchParams(params: URLSearchParams): AssetFilters {
  const estado = params.get("estado");
  const asignacion = params.get("asignacion");

  return {
    q: params.get("q")?.trim() ?? "",
    estado: ASSET_STATUSES.find((s) => s === estado),
    asignacion: ASSIGNMENTS.find((a) => a === asignacion),
  };
}

/** Escribe solo los filtros con valor, para mantener la URL limpia. */
export function toSearchParams(filters: AssetFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.estado) params.set("estado", filters.estado);
  if (filters.asignacion) params.set("asignacion", filters.asignacion);

  return params;
}

export function hasActiveFilters(filters: AssetFilters): boolean {
  return Boolean(filters.q.trim() || filters.estado || filters.asignacion);
}

/** Arma un enlace a la lista ya filtrada (lo usan las tarjetas del dashboard). */
export function buildAssetsLink(
  basePath: string,
  filters: Partial<AssetFilters> = {},
): string {
  const qs = toSearchParams({ q: "", ...filters }).toString();

  return qs ? `${basePath}?${qs}` : basePath;
}
