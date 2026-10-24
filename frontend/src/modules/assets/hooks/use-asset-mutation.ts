import { useMutation, useQueryClient } from "@tanstack/react-query";
// Actions
import {
  assignAsset,
  changeAssetStatus,
  closeMaintenance,
  createAsset,
  decommissionAsset,
  moveAsset,
  openMaintenance,
  returnAssignment,
  updateAsset,
} from "../api/assets.mutation";
// SCHEMA - Mutations
import type { ChangeStatusValues } from "../schema/asset-status.schema";
// SCHEMA - ACTIONS ASSET
import type {
  DecommissionValues,
  CloseMaintenanceValues,
  OpenMaintenanceValues,
  MoveValues,
  AssignValues,
  ReturnAssignmentValues,
} from "../schema/activons.schema";
// Keys
import { assetKeys } from "../utils/asset-query-keys";
import type { EditAssetValues } from "../schema/asset-form.schema";

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useUpdateAsset(assetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EditAssetValues) => updateAsset(assetId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useChangeStatus(assetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ChangeStatusValues) =>
      changeAssetStatus(assetId, values),
    // Refresca lista, ficha e historiales del activo.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useOpenMaintenance(assetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OpenMaintenanceValues) =>
      openMaintenance(assetId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useCloseMaintenance(maintenanceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CloseMaintenanceValues) =>
      closeMaintenance(maintenanceId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useDecommission(assetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: DecommissionValues) =>
      decommissionAsset(assetId, values),
    // Tras la baja, la ficha responde 410. "none" marca todo como desactualizado
    // sin refetch inmediato, para no mostrar el aviso de baja antes de salir de la pantalla.
    // La lista y la ficha se piden de nuevo la próxima vez que se abran.
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: assetKeys.all,
        refetchType: "none",
      }),
  });
}

function useAssetMutation<V>(fn: (values: V) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export const useMoveAsset = (assetId: number) =>
  useAssetMutation((values: MoveValues) => moveAsset(assetId, values));

export const useAssignAsset = (assetId: number) =>
  useAssetMutation((values: AssignValues) => assignAsset(assetId, values));

export const useReturnAssignment = (assignmentId: number) =>
  useAssetMutation((values: ReturnAssignmentValues) =>
    returnAssignment(assignmentId, values),
  );
