import { useQuery } from "@tanstack/react-query";
import { getAssetCard } from "../api/assets.api";
import { assetKeys } from "./useAsset";

export function useAssetCard(codigo: string) {
  return useQuery({
    queryKey: assetKeys.card(codigo),
    queryFn: () => getAssetCard(codigo),
  });
}
