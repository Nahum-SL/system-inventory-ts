import type { UseQueryResult } from "@tanstack/react-query";
// Atomic Components
import SearchSelect, {
  type SearchSelectOption,
} from "@/shared/components/ui/form/SearchSelect";
// hooks
import {
  useAreas,
  useBrands,
  useCategories,
  usePeople,
  usePositions,
} from "../hooks/use-catalog-queries";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
}

/** `allLabel`: agrega una primera opción con valor "" (para filtros: "Todas las áreas"). */
type NamedProps = SelectProps & { allLabel?: string };

const NONE: number[] = [];
const LOAD_ERROR = "No se pudo cargar la lista";

export function PersonSelect({
  excludeIds = NONE,
  ...props
}: SelectProps & { excludeIds?: number[] }) {
  const { data, isPending, error } = usePeople();

  const options: SearchSelectOption[] = (data ?? [])
    .filter((p) => !excludeIds.includes(p.id))
    .map((p) => ({
      value: String(p.id),
      label: `${p.apellidos}, ${p.nombres}`,
      hint: p.numerodoc,
    }));

  return (
    <SearchSelect
      {...props}
      options={options}
      placeholder="Busca una persona…"
      loading={isPending}
      errorMessage={error ? LOAD_ERROR : undefined}
    />
  );
}

export function PositionSelect(props: SelectProps) {
  const { data, isPending, error } = usePositions();

  const options: SearchSelectOption[] = (data ?? []).map((p) => ({
    value: String(p.id),
    label: `${p.areaNombre} · ${p.nombre}`,
  }));

  return (
    <SearchSelect
      {...props}
      options={options}
      placeholder="Busca un cargo…"
      loading={isPending}
      errorMessage={error ? LOAD_ERROR : undefined}
    />
  );
}

function NamedSelect<T extends { id: number; nombre: string }>({
  query,
  placeholder,
  excludeId,
  allLabel,
  ...props
}: NamedProps & {
  query: UseQueryResult<T[]>;
  placeholder: string;
  excludeId?: number;
}) {
  const items: SearchSelectOption[] = (query.data ?? [])
    .filter((item) => item.id !== excludeId)
    .map((item) => ({ value: String(item.id), label: item.nombre }));

  const options = allLabel ? [{ value: "", label: allLabel }, ...items] : items;

  return (
    <SearchSelect
      {...props}
      options={options}
      placeholder={allLabel ?? placeholder}
      loading={query.isPending}
      errorMessage={query.error ? LOAD_ERROR : undefined}
    />
  );
}

export const BrandSelect = (props: NamedProps) => (
  <NamedSelect {...props} query={useBrands()} placeholder="Busca una marca…" />
);

export const CategorySelect = (props: NamedProps) => (
  <NamedSelect
    {...props}
    query={useCategories()}
    placeholder="Busca una categoría…"
  />
);

export const AreaSelect = ({
  excludeId,
  ...props
}: NamedProps & { excludeId?: number }) => (
  <NamedSelect
    {...props}
    query={useAreas()}
    placeholder="Busca un área…"
    excludeId={excludeId}
  />
);
