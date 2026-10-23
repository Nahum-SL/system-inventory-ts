import { useQuery } from "@tanstack/react-query";
import { listAssets } from "../api/assets.api";
import type { AssetFilters } from "../types";

export const assetKeys = {
  all: ["assets"] as const,
  list: (filters: AssetFilters) => ["assets", "list", filters] as const,
  card: (codigo: string) => ["assets", "card", codigo] as const,
  qr: (id: number) => ["assets", "qr", id] as const,
  history: (kind: string, id: number) =>
    ["assets", "history", kind, id] as const,
};

export function useAssets(filters: AssetFilters) {
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: () => listAssets(filters),
    placeholderData: (previous) => previous, // evita parpadeos al escribir
  });
}
