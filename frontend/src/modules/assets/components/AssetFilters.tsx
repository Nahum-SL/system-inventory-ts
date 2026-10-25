import { controlClass } from "@/shared/components/ui/Buttons/style.button";
import type { AssetFilters, AssetStatus, AssignmentFilter } from "../types";
import { ASSET_STATUSES, ASSIGNMENT_LABELS } from "../utils/filters";
import { STATUS_LABELS } from "../utils/status";

interface Props {
  filters: AssetFilters;
  text: string;
  hasActive: boolean;
  onSearch: (value: string) => void;
  onChange: (patch: Partial<AssetFilters>) => void;
  onClear: () => void;
}

export default function AssetFiltersBar({
  filters,
  text,
  hasActive,
  onSearch,
  onChange,
  onClear,
}: Props) {
  return (
    <div className="space-y-2">
      <input
        type="search"
        value={text}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Buscar por código, descripción, marca, área…"
        className={controlClass}
      />

      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Filtrar por estado"
          value={filters.estado ?? ""}
          onChange={(e) =>
            onChange({
              estado: ASSET_STATUSES.find(
                (s: AssetStatus) => s === e.target.value,
              ),
            })
          }
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ASSET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por responsable"
          value={filters.asignacion ?? ""}
          onChange={(e) =>
            onChange({
              asignacion: (
                Object.keys(ASSIGNMENT_LABELS) as AssignmentFilter[]
              ).find((a) => a === e.target.value),
            })
          }
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Con o sin responsable</option>
          {(Object.keys(ASSIGNMENT_LABELS) as AssignmentFilter[]).map((a) => (
            <option key={a} value={a}>
              {ASSIGNMENT_LABELS[a]}
            </option>
          ))}
        </select>

        {hasActive && (
          <button onClick={onClear} className="text-sm text-blue-700 underline">
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
