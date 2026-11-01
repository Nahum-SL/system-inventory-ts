import { api } from "@/shared/lib/api-client";
import type { AssetExportFilters, DateRange } from "../types";

function query(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value?.trim()) qs.set(key, value.trim());
  }

  const text = qs.toString();
  return text ? `?${text}` : "";
}

export const downloadAssets = (f: AssetExportFilters) =>
  api.getFile(
    `/reports/export/assets${query({ q: f.q, estado: f.estado, asignacion: f.asignacion })}`,
  );

export const downloadMovements = (r: DateRange) =>
  api.getFile(
    `/reports/export/movements${query({ desde: r.desde, hasta: r.hasta })}`,
  );

export const downloadMaintenance = (r: DateRange) =>
  api.getFile(
    `/reports/export/maintenance${query({ desde: r.desde, hasta: r.hasta })}`,
  );

export const downloadAssetSheet = (codigo: string) =>
  api.getFile(`/reports/export/asset-sheet/${encodeURIComponent(codigo)}`);

/**
 * API PARA EL ENDPOINT DE EXPORTAR LOS ACTIVOS A PDF (SIN HISTORIAL - MOVIMIENTOS ..)
 * @param f 
 * @returns 
 */
export const downloadAssetsPdf = (
  f: AssetExportFilters & { incluirBajas?: boolean },
) =>
  api.getFile(
    `/reports/export/assets-pdf${query({
      q: f.q,
      estado: f.estado,
      asignacion: f.asignacion,
      incluirBajas: f.incluirBajas ? "true" : undefined,
    })}`,
  );
