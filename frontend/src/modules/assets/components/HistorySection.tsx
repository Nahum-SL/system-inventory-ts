import { useMemo, useState } from "react";
import { History } from "lucide-react";
// ATOMIC COMPONENTS
import Alert from "@/shared/components/ui/Alert";
import { EmptyState } from "@/shared/components/ui/states/EmptyState";
import { LoadingState } from "@/shared/components/ui/states/LoadingState";
// HOOKS
import {
  useAssignmentHistory,
  useMaintenanceHistory,
  useMovementHistory,
} from "../hooks/useAssetHistory";
// UTILS
import { buildHistoryEvents, type HistoryKind } from "../utils/history-events";
// COMPONENTS - CHARTS
import AssetHistoryTimeline from "./charts/AssetHistoryTimeline";
// COMPONENTS - UI
import type { ChipOption } from "@/shared/components/ui/ChiGroup";
import ChipGroup from "@/shared/components/ui/ChiGroup";
import Card from "@/shared/components/ui/Card";

type Filter = "todos" | HistoryKind;

const EMPTY_TEXT: Record<Filter, string> = {
  todos: "Este activo todavía no tiene historial.",
  asignacion: "Este activo todavía no ha sido asignado.",
  mantenimiento: "Este activo no tiene mantenimientos registrados.",
  traslado: "Este activo no ha sido trasladado.",
};

export default function HistorySection({ assetId }: { assetId: number }) {
  const [filter, setFilter] = useState<Filter>("todos");

  const assignments = useAssignmentHistory(assetId);
  const maintenance = useMaintenanceHistory(assetId);
  const movements = useMovementHistory(assetId);

  const queries = [assignments, maintenance, movements];
  const pending = queries.some((query) => query.isPending);
  const errors = [
    ...new Set(queries.flatMap((query) => query.error?.message ?? [])),
  ];

  const events = useMemo(
    () =>
      buildHistoryEvents({
        assignments: assignments.data,
        maintenance: maintenance.data,
        movements: movements.data,
      }),
    [assignments.data, maintenance.data, movements.data],
  );

  const countOf = (kind: HistoryKind) =>
    pending ? undefined : events.filter((event) => event.kind === kind).length;

  const options: ChipOption<Filter>[] = [
    {
      value: "todos",
      label: "Todos",
      count: pending ? undefined : events.length,
    },
    {
      value: "asignacion",
      label: "Asignaciones",
      count: countOf("asignacion"),
    },
    {
      value: "mantenimiento",
      label: "Mantenimientos",
      count: countOf("mantenimiento"),
    },
    { value: "traslado", label: "Traslados", count: countOf("traslado") },
  ];

  const visible =
    filter === "todos"
      ? events
      : events.filter((event) => event.kind === filter);

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Historial del activo
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Linea del tiempo - Asignaciones, mantenimientos y traslados, del más reciente al más
          antiguo.
        </p>
      </div>

      <ChipGroup
        label="Filtrar historial"
        options={options}
        value={filter}
        onChange={setFilter}
        className="mb-5"
      />

      {pending ? (
        <div className="py-4" role="status" aria-label="Cargando historial">
          <LoadingState />
        </div>
      ) : (
        <>
          {errors.length > 0 && (
            <div className="mb-4 space-y-2">
              {errors.map((message) => (
                <Alert key={message}>{message}</Alert>
              ))}
            </div>
          )}

          {visible.length > 0 ? (
            <AssetHistoryTimeline events={visible} />
          ) : (
            errors.length === 0 && (
              <EmptyState icon={History} title={EMPTY_TEXT[filter]} />
            )
          )}
        </>
      )}
    </Card>
  );
}
