import { useQueries } from "@tanstack/react-query";
// 
import { getAssetQr } from "../api/assets.api";
// Keys
import { assetKeys } from "../utils/asset-query-keys";

export function useAssetQrs(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: assetKeys.qr(id),
      queryFn: () => getAssetQr(id),
      staleTime: Infinity,
    })),
  });
}
