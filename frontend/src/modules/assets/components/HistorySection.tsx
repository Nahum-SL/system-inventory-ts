import { useState, type ReactNode } from "react";
import { ArrowLeftRight, ClipboardList, Wrench } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { formatDate, titleCase } from "@/shared/lib/date/format";
import { LoadingState } from "@/shared/components/ui/states/LoadingState";

import {
  useAssignmentHistory,
  useMaintenanceHistory,
  useMovementHistory,
} from "../hooks/useAssetHistory";

type Tab = "assignments" | "maintenance" | "movements";

const TABS: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
  { id: "assignments", label: "Asignaciones", icon: ClipboardList },
  { id: "maintenance", label: "Mantenimientos", icon: Wrench },
  { id: "movements", label: "Traslados", icon: ArrowLeftRight },
];

const panelClass = cn(
  "min-w-0 rounded-2xl border p-4 sm:p-5",
  "border-slate-200 bg-white shadow-sm",
  "dark:border-gray-700 dark:bg-gray-900",
);

function State({
  isPending,
  error,
  empty,
  emptyText,
  children,
}: {
  isPending: boolean;
  error: Error | null;
  empty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  if (isPending) {
    return (
      <div className="py-4" role="status" aria-label="Cargando historial">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
      >
        {error.message}
      </div>
    );
  }

  if (empty) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-gray-700 dark:text-slate-400">
        {emptyText}
      </p>
    );
  }

  // Línea de tiempo: la línea vertical une los puntos de cada registro.
  return (
    <ul className="ml-1.5 border-l border-slate-200 pl-6 dark:border-gray-700">
      {children}
    </ul>
  );
}

function HistoryItem({
  active = false,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <li className="relative space-y-1.5 py-3.5">
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-5.25 -left-[29.5px] size-2.5 rounded-full border-2",
          active
            ? "border-emerald-500 bg-emerald-500"
            : "border-slate-300 bg-white dark:border-gray-600 dark:bg-gray-900",
        )}
      />
      {children}
    </li>
  );
}

function PrimaryText({ children }: { children: ReactNode }) {
  return (
    <p className="wrap-break-word text-base font-semibold text-slate-800 dark:text-slate-100">
      {children}
    </p>
  );
}

function SecondaryText({ children }: { children: ReactNode }) {
  return (
    <p className="wrap-break-word text-sm text-slate-600 dark:text-slate-300">
      {children}
    </p>
  );
}

function MutedText({ children }: { children: ReactNode }) {
  return (
    <p className="wrap-break-word text-sm leading-5 text-slate-500 dark:text-slate-400">
      {children}
    </p>
  );
}

function Period({ from, to }: { from: string; to: string | null }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
      {formatDate(from)} →{" "}
      {to ? (
        formatDate(to)
      ) : (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          En curso
        </span>
      )}
    </p>
  );
}

function Assignments({
  query,
}: {
  query: ReturnType<typeof useAssignmentHistory>;
}) {
  const { data, isPending, error } = query;

  return (
    <State
      isPending={isPending}
      error={error}
      empty={!data?.length}
      emptyText="Este activo todavía no ha sido asignado."
    >
      {data?.map((assignment) => (
        <HistoryItem key={assignment.id} active={!assignment.fechaFin}>
          <PrimaryText>
            {titleCase(assignment.personaNombre)} · {assignment.cargoNombre}
          </PrimaryText>

          <Period from={assignment.fechaInicio} to={assignment.fechaFin} />

          <MutedText>
            Condición de entrega: {assignment.condicionEntrega}
          </MutedText>

          {assignment.condicionDevolucion && (
            <MutedText>
              Condición de devolución: {assignment.condicionDevolucion}
            </MutedText>
          )}
        </HistoryItem>
      ))}
    </State>
  );
}

function Maintenance({
  query,
}: {
  query: ReturnType<typeof useMaintenanceHistory>;
}) {
  const { data, isPending, error } = query;

  return (
    <State
      isPending={isPending}
      error={error}
      empty={!data?.length}
      emptyText="Este activo no tiene mantenimientos registrados."
    >
      {data?.map((maintenance) => (
        <HistoryItem key={maintenance.id} active={!maintenance.fechaFin}>
          <PrimaryText>
            {maintenance.descripcion}
            <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">
              ({maintenance.tipo})
            </span>
          </PrimaryText>

          <Period from={maintenance.fecha} to={maintenance.fechaFin} />

          {maintenance.observaciones && (
            <MutedText>Observaciones: {maintenance.observaciones}</MutedText>
          )}
        </HistoryItem>
      ))}
    </State>
  );
}

function Movements({
  query,
}: {
  query: ReturnType<typeof useMovementHistory>;
}) {
  const { data, isPending, error } = query;

  return (
    <State
      isPending={isPending}
      error={error}
      empty={!data?.length}
      emptyText="Este activo no ha sido trasladado."
    >
      {data?.map((movement) => (
        <HistoryItem key={movement.id}>
          <PrimaryText>
            {movement.areaOrigenNombre ?? "Sin área de origen"} →{" "}
            {movement.areaDestinoNombre}
          </PrimaryText>

          <SecondaryText>
            {formatDate(movement.fechaMovimiento)} · Registrado por
            {movement.username}
          </SecondaryText>

          {movement.motivo && <MutedText>Motivo: {movement.motivo}</MutedText>}
        </HistoryItem>
      ))}
    </State>
  );
}

export default function HistorySection({ assetId }: { assetId: number }) {
  const [tab, setTab] = useState<Tab>("assignments");

  const assignments = useAssignmentHistory(assetId);
  const maintenance = useMaintenanceHistory(assetId);
  const movements = useMovementHistory(assetId);

  const counts: Record<Tab, number | undefined> = {
    assignments: assignments.data?.length,
    maintenance: maintenance.data?.length,
    movements: movements.data?.length,
  };

  return (
    <section className={panelClass}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Historial del activo
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Consulta asignaciones, mantenimientos y traslados registrados.
        </p>
      </div>

      <div
        className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="group"
        aria-label="Tipo de historial"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = tab === id;
          const count = counts[id];

          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex min-h-10 items-center justify-center gap-2",
                "rounded-xl border px-3 py-2 text-sm font-medium",
                "transition-colors focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-amber-500",
                "cursor-pointer",
                selected
                  ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-300 dark:hover:bg-gray-800",
              )}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
              {count !== undefined && (
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold dark:bg-white/10">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="min-w-0">
        {tab === "assignments" && <Assignments query={assignments} />}
        {tab === "maintenance" && <Maintenance query={maintenance} />}
        {tab === "movements" && <Movements query={movements} />}
      </div>
    </section>
  );
}
