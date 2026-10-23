import { useQuery } from "@tanstack/react-query";
import { getAssetQr } from "../api/assets.api";
import { assetKeys } from "./useAsset";

export function useAssetQr(id: number | undefined) {
  return useQuery({
    queryKey: assetKeys.qr(id ?? 0),
    queryFn: () => getAssetQr(id!),
    enabled: id !== undefined,
    staleTime: Infinity, // el QR no cambia mientras el código sea inmutable
  });
}
