import { useQuery } from "@tanstack/react-query";
import { getAssetCard } from "../api/assets.api"
import { assetKeys } from "../utils/asset-query-keys";

export function useAssetCard(codigo: string) {
  return useQuery({
    queryKey: assetKeys.card(codigo),
    queryFn: () => getAssetCard(codigo),
  });
}
