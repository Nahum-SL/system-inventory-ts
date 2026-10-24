import { useQuery } from "@tanstack/react-query";
// Api - Categorias
import {
  listAreas,
  listBrands,
  listCategories,
  listPeople,
  listPositions,
} from "../api/catalog.api";

const staleTime = 5 * 60_000;

export const catalogKeys = {
  areas: ["catalogs", "areas"] as const,
  people: ["catalogs", "people"] as const,
  positions: ["catalogs", "positions"] as const,
  brands: ["catalogs", "brands"] as const,
  categories: ["catalogs", "categories"] as const,
};

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
