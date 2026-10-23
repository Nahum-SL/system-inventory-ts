// API CLIENT
import { api } from "../../../shared/lib/api-client";
// Types API
import type {
  ApiResponse,
  ListResponse,
} from "../../../shared/types/api.types";
// Types
import type {
  Asset,
  AssetCard,
  AssetFilters,
  AssignmentRecord,
  MaintenanceRecord,
  MovementRecord,
} from "../types";

/**
 * Lista a los activos
 * @param filters 
 * @returns 
 */
export const listAssets = async (filters: AssetFilters): Promise<Asset[]> => {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.estado) params.set("estado", filters.estado);
  const qs = params.toString();

  return (await api.get<ListResponse<Asset>>(`/assets${qs ? `?${qs}` : ""}`))
    .data;
};

export const getAssetCard = async (codigo: string): Promise<AssetCard> =>
  (
    await api.get<ApiResponse<AssetCard>>(
      `/assets/code/${encodeURIComponent(codigo)}`,
    )
  ).data;

/** El endpoint exige sesión, por eso se pide con fetch y no con <img src>. */
export const getAssetQr = (id: number): Promise<string> =>
  api.getText(`/assets/${id}/qr`);

export const getAssignmentHistory = async (
  id: number,
): Promise<AssignmentRecord[]> =>
  (await api.get<ListResponse<AssignmentRecord>>(`/assets/${id}/assignments`))
    .data;

export const getMaintenanceHistory = async (
  id: number,
): Promise<MaintenanceRecord[]> =>
  (await api.get<ListResponse<MaintenanceRecord>>(`/assets/${id}/maintenance`))
    .data;

export const getMovementHistory = async (
  id: number,
): Promise<MovementRecord[]> =>
  (await api.get<ListResponse<MovementRecord>>(`/assets/${id}/movements`)).data;
