import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
// TYPES
import type { AssetFilters } from "../types";
// UTILS
import {
  hasActiveFilters,
  parseSearchParams,
  toSearchParams,
} from "../utils/filters";

const SEARCH_DELAY_MS = 300;

/**
 * Filtros de la lista guardados en la URL (?q=&estado=&asignacion=).
 * El texto de búsqueda tiene estado local y se pasa a la URL con retraso.
 */
export function useAssetFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams],
  );

  const [text, setText] = useState(filters.q);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Siempre combina con los filtros más recientes, incluso si el temporizador es viejo.
  const latest = useRef(filters);
  useEffect(() => {
    latest.current = filters;
  }, [filters]);

  const update = useCallback(
    (patch: Partial<AssetFilters>) => {
      setSearchParams(toSearchParams({ ...latest.current, ...patch }), {
        replace: true,
      });
    },
    [setSearchParams],
  );

  const onSearch = useCallback(
    (value: string) => {
      setText(value);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = undefined;
        update({ q: value.trim() });
      }, SEARCH_DELAY_MS);
    },
    [update],
  );

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
    setText("");
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // URL → input (botón "atrás", enlaces del dashboard), salvo que el usuario esté escribiendo.
  useEffect(() => {
    if (timer.current === undefined) setText(filters.q);
  }, [filters.q]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return {
    filters,
    text,
    onSearch,
    update,
    clear,
    hasActive: hasActiveFilters(filters),
  };
}
