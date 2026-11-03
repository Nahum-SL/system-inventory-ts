import { useQuery } from "@tanstack/react-query";

import { getNextAssetCode } from "../api/assets.api";
import { assetKeys } from "../utils/asset-query-keys";

export function useNextAssetCode() {
  return useQuery({
    queryKey: [...assetKeys.all, "next-code"],
    queryFn: getNextAssetCode,
    // Se pide una vez por apertura del formulario y no se refresca solo:
    // un cambio a mitad de escritura haría perder lo que el usuario ya tecleó.
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
