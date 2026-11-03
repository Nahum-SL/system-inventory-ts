// Atomic Components
import SearchSelect, {
  type SearchSelectOption,
} from "@/shared/components/ui/form/SearchSelect";
// hooks
import { usePeople, usePositions } from "@/modules/catalogs";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
}

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
