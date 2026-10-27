import { RotateCcw, SlidersHorizontal } from "lucide-react";

import SearchInput from "@/shared/components/ui/inputs/SearchInput";
import { cn } from "@/shared/lib/utils";

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

const selectClass = cn(
  "min-h-11 w-full min-w-0 rounded-xl border px-3 py-2 text-sm",
  "border-slate-300 bg-white text-slate-700",
  "transition-colors outline-none",
  "hover:border-slate-400",
  "focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/20",
  "dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200",
  "dark:hover:border-gray-600",
  "dark:focus-visible:border-amber-500",
);

const labelClass =
  "mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400";

export default function AssetFiltersBar({
  filters,
  text,
  hasActive,
  onSearch,
  onChange,
  onClear,
}: Props) {
  return (
    <section
      aria-label="Filtros de activos"
      className={cn(
        "space-y-4 rounded-2xl border p-4 sm:p-5",
        "border-slate-200 bg-white shadow-sm",
        "dark:border-gray-700 dark:bg-gray-900",
      )}
    >
      {/* Búsqueda */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={16}
            className="text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Buscar y filtrar
          </h2>
        </div>

        <SearchInput
          id="assets-search"
          value={text}
          onChange={onSearch}
          placeholder="Buscar por código, descripción, marca o área..."
          className="rounded-xl"
        />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <label className={labelClass} htmlFor="assets-status-filter">
            Estado del activo
          </label>

          <select
            id="assets-status-filter"
            aria-label="Filtrar por estado"
            value={filters.estado ?? ""}
            onChange={(event) => {
              const value = event.target.value;

              onChange({
                estado: ASSET_STATUSES.find(
                  (status: AssetStatus) => status === value,
                ),
              });
            }}
            className={selectClass}
          >
            <option value="">Todos los estados</option>

            {ASSET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label className={labelClass} htmlFor="assets-assignment-filter">
            Asignación
          </label>

          <select
            id="assets-assignment-filter"
            aria-label="Filtrar por responsable"
            value={filters.asignacion ?? ""}
            onChange={(event) => {
              const value = event.target.value;

              onChange({
                asignacion: (
                  Object.keys(ASSIGNMENT_LABELS) as AssignmentFilter[]
                ).find((assignment) => assignment === value),
              });
            }}
            className={selectClass}
          >
            <option value="">Con o sin responsable</option>

            {(Object.keys(ASSIGNMENT_LABELS) as AssignmentFilter[]).map(
              (assignment) => (
                <option key={assignment} value={assignment}>
                  {ASSIGNMENT_LABELS[assignment]}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="flex min-h-11 items-center lg:justify-end">
          {hasActive && (
            <button
              type="button"
              onClick={onClear}
              className={cn(
                "inline-flex min-h-10 items-center justify-center gap-2",
                "rounded-xl border px-3 py-2 text-sm font-medium",
                "border-slate-200 text-slate-600",
                "transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800",
                "dark:border-gray-700 dark:text-slate-300",
                "dark:hover:border-amber-900/70 dark:hover:bg-amber-950/40 dark:hover:text-amber-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer",
              )}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
