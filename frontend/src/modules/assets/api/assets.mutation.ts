// api
import type { ApiResponse } from "@/shared/types/api.types";
import { api } from "@/shared/lib/api-client";
// types
import type { Asset, MaintenanceRecord } from "../types";

import type {
  AssignValues,
  CloseMaintenanceValues,
  DecommissionValues,
  MoveValues,
  OpenMaintenanceValues,
  ReturnAssignmentValues,
} from "../schema/activons.schema";
import type { ChangeStatusValues } from "../schema/asset-status.schema";
import type {
  CreateAssetValues,
  EditAssetValues,
} from "../schema/asset-form.schema";

// =================
// POST
// =================

export const createAsset = async (values: CreateAssetValues): Promise<Asset> =>
  (await api.post<ApiResponse<Asset>>("/assets", values)).data;

/**
 * Obtiene el `motivo` de la tabla mantenimientos
 * @param id
 * @param values
 * @returns
 */
export const decommissionAsset = (id: number, values: DecommissionValues) =>
  api.post<ApiResponse<null>>(`/assets/${id}/decommission`, values);

/**
 * Obtiene el `id` para el man
 * @param assetId
 * @param values
 * @returns
 */
export const openMaintenance = (
  assetId: number,
  values: OpenMaintenanceValues,
) =>
  api.post<ApiResponse<MaintenanceRecord>>(
    `/assets/${assetId}/maintenance`,
    values,
  );

export const moveAsset = (assetId: number, values: MoveValues) =>
  api.post<ApiResponse<unknown>>(`/assets/${assetId}/movements`, values);

export const assignAsset = (assetId: number, values: AssignValues) =>
  api.post<ApiResponse<unknown>>(`/assets/${assetId}/assignments`, values);

// =================
// PATCH
// =================

export const updateAsset = async (
  id: number,
  values: EditAssetValues,
): Promise<Asset> =>
  (await api.patch<ApiResponse<Asset>>(`/assets/${id}`, values)).data;

export const returnAssignment = (
  assignmentId: number,
  values: ReturnAssignmentValues,
) =>
  api.patch<ApiResponse<unknown>>(
    `/assignments/${assignmentId}/return`,
    values,
  );

export const closeMaintenance = (
  maintenanceId: number,
  values: CloseMaintenanceValues,
) =>
  api.patch<ApiResponse<MaintenanceRecord>>(
    `/maintenance/${maintenanceId}/close`,
    values,
  );

/**
 * Cambiar estado de un Activo
 * @param id
 * @param values
 * @returns
 */
export const changeAssetStatus = async (
  id: number,
  values: ChangeStatusValues,
): Promise<Asset> =>
  (await api.patch<ApiResponse<Asset>>(`/assets/${id}/status`, values)).data;
