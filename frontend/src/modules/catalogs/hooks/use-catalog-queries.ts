import { useQuery } from "@tanstack/react-query";
// Api - Categorias
import {
  listAreas,
  listBrands,
  listCategories,
  listPeople,
  listPositions,
} from "../api/catalog.api";

import type { NamedKind } from "../types";

const staleTime = 5 * 60_000;

export const catalogKeys = {
  areas: ["catalogs", "areas"] as const,
  people: ["catalogs", "people"] as const,
  positions: ["catalogs", "positions"] as const,
  brands: ["catalogs", "brands"] as const,
  categories: ["catalogs", "categories"] as const,
};

const NAMED = {
  areas: { key: catalogKeys.areas, fn: listAreas },
  brands: { key: catalogKeys.brands, fn: listBrands },
  categories: { key: catalogKeys.categories, fn: listCategories },
} as const;

export const useAreas = () =>
  useQuery({ queryKey: catalogKeys.areas, queryFn: listAreas, staleTime });

export const usePeople = () =>
  useQuery({ queryKey: catalogKeys.people, queryFn: listPeople, staleTime });

export const usePositions = () =>
  useQuery({
    queryKey: catalogKeys.positions,
    queryFn: listPositions,
    staleTime,
  });

export const useBrands = () =>
  useQuery({ queryKey: catalogKeys.brands, queryFn: listBrands, staleTime });
export const useCategories = () =>
  useQuery({
    queryKey: catalogKeys.categories,
    queryFn: listCategories,
    staleTime,
  });

export const useNamedCatalog = (kind: NamedKind) =>
  useQuery({ queryKey: NAMED[kind].key, queryFn: NAMED[kind].fn, staleTime });
