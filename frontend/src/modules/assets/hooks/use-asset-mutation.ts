import { useMutation, useQueryClient } from "@tanstack/react-query";
// Actions
import { changeAssetStatus } from "../api/assets.api";
// Schemas
import type { ChangeStatusValues } from "../schema/asset-status.schema";
// Keys
import { assetKeys } from "../utils/asset-query-keys";

export function useChangeStatus(assetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ChangeStatusValues) =>
      changeAssetStatus(assetId, values),
    // Refresca lista, ficha e historiales del activo.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  });
}
