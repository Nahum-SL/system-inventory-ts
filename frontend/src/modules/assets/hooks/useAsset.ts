import { useQuery } from "@tanstack/react-query";
import { listAssets } from "../api/assets.api";
import type { AssetFilters } from "../types";
import { assetKeys } from "../utils/asset-query-keys";

export function useAssets(filters: AssetFilters) {
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: () => listAssets(filters),
    placeholderData: (previous) => previous, // evita parpadeos al escribir
  });
}
