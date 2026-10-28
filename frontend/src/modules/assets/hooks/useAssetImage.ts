import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAssetImage } from "../api/assets.api";
import { assetKeys } from "../utils/asset-query-keys";

/** Descarga la imagen con el token y la expone como URL temporal para <img>. */
export function useAssetImage(id: number, archivo: string | null) {
  const query = useQuery({
    queryKey: assetKeys.image(id, archivo ?? ""),
    queryFn: () => getAssetImage(id),
    enabled: archivo !== null,
    staleTime: Infinity, // el nombre del archivo cambia con cada imagen nueva
  });

  const [url, setUrl] = useState<string | null>(null);

  // Crea la URL del blob y la libera al cambiar o desmontar (seguro con StrictMode).
  useEffect(() => {
    if (!query.data) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(query.data);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [query.data]);

  return { url, isLoading: query.isLoading, isError: query.isError };
}
