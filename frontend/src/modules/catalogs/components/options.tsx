import type { UseQueryResult } from "@tanstack/react-query";
// HOOKS
import {
  useAreas,
  useBrands,
  useCategories,
  usePeople,
  usePositions,
} from "../hooks/use-catalog-queries";

function Options<T extends { id: number }>({
  query,
  placeholder,
  label,
}: {
  query: UseQueryResult<T[]>;
  placeholder: string;
  label: (item: T) => string;
}) {
  if (query.isPending) return <option value="">Cargando…</option>;
  if (query.error) return <option value="">No se pudo cargar la lista</option>;

  return (
    <>
      <option value="">{placeholder}</option>
      {query.data.map((item) => (
        <option key={item.id} value={item.id}>
          {label(item)}
        </option>
      ))}
    </>
  );
}

/**
 * Permite seleccionar un Area para el Activo
 * @param param
 * @returns
 */
export function AreaOptions({ excludeId }: { excludeId?: number }) {
  const { data, isPending, error } = useAreas();

  if (isPending) return <option value="">Cargando…</option>;
  if (error) return <option value="">No se pudo cargar la lista</option>;

  return (
    <>
      <option value="">Selecciona un área…</option>
      {data
        .filter((a) => a.id !== excludeId)
        .map((a) => (
          <option key={a.id} value={a.id}>
            {a.nombre}
          </option>
        ))}
    </>
  );
}

export function PersonOptions({ excludeIds = [] }: { excludeIds?: number[] }) {
  const { data, isPending, error } = usePeople();

  if (isPending) return <option value="">Cargando…</option>;
  if (error) return <option value="">No se pudo cargar la lista</option>;

  return (
    <>
      <option value="">Selecciona una persona…</option>
      {data
        .filter((p) => !excludeIds.includes(p.id))
        .map((p) => (
          <option key={p.id} value={p.id}>
            {`${p.apellidos}, ${p.nombres} · ${p.numerodoc}`}
          </option>
        ))}
    </>
  );
}

export function PositionOptions() {
  return (
    <Options
      query={usePositions()}
      placeholder="Selecciona un cargo…"
      label={(p) => `${p.areaNombre} · ${p.nombre}`}
    />
  );
}

export function BrandOptions() {
  return (
    <Options
      query={useBrands()}
      placeholder="Selecciona una marca…"
      label={(b) => b.nombre}
    />
  );
}

export function CategoryOptions() {
  return (
    <Options
      query={useCategories()}
      placeholder="Selecciona una categoría…"
      label={(c) => c.nombre}
    />
  );
}
