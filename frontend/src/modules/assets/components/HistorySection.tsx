import { useState, type ReactNode } from "react";
import { ArrowLeftRight, ClipboardList, Wrench } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { LoadingState } from "@/shared/components/ui/states/LoadingState";

import {
  useAssignmentHistory,
  useMaintenanceHistory,
  useMovementHistory,
} from "../hooks/useAssetHistory";

type Tab = "assignments" | "maintenance" | "movements";

const TABS: {
  id: Tab;
  label: string;
  icon: typeof ClipboardList;
}[] = [
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
  children,
}: {
  isPending: boolean;
  error: Error | null;
  empty: boolean;
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
        No hay registros en esta sección.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-gray-800">
      {children}
    </ul>
  );
}

function HistoryItem({ children }: { children: ReactNode }) {
  return <li className="space-y-1.5 py-4 first:pt-1 last:pb-1">{children}</li>;
}

function PrimaryText({ children }: { children: ReactNode }) {
  return (
    <p className="wrap-break-word text-sm font-semibold text-slate-800 dark:text-slate-100">
      {children}
    </p>
  );
}

function SecondaryText({ children }: { children: ReactNode }) {
  return (
    <p className="wrap-break-word text-sm text-slate-600 dark:text-slate-400">
      {children}
    </p>
  );
}

function MutedText({ children }: { children: ReactNode }) {
  return (
    <p className="wrap-break-word text-xs leading-5 text-slate-500 dark:text-slate-400">
      {children}
    </p>
  );
}

function Assignments({ id }: { id: number }) {
  const { data, isPending, error } = useAssignmentHistory(id);

  return (
    <State
      isPending={isPending}
      error={error}
      empty={!isPending && !error && (data?.length ?? 0) === 0}
    >
      {data?.map((assignment) => (
        <HistoryItem key={assignment.id}>
          <PrimaryText>
            {assignment.personaNombre} · {assignment.cargoNombre}
          </PrimaryText>

          <SecondaryText>
            {assignment.fechaInicio} → {assignment.fechaFin ?? "En curso"}
          </SecondaryText>

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

function Maintenance({ id }: { id: number }) {
  const { data, isPending, error } = useMaintenanceHistory(id);

  return (
    <State
      isPending={isPending}
      error={error}
      empty={!isPending && !error && (data?.length ?? 0) === 0}
    >
      {data?.map((maintenance) => (
        <HistoryItem key={maintenance.id}>
          <PrimaryText>
            {maintenance.descripcion}
            <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">
              ({maintenance.tipo})
            </span>
          </PrimaryText>

          <SecondaryText>
            {maintenance.fecha} → {maintenance.fechaFin ?? "En curso"}
          </SecondaryText>

          {maintenance.observaciones && (
            <MutedText>Observaciones: {maintenance.observaciones}</MutedText>
          )}

          <MutedText>Costo: S/ {maintenance.costo.toFixed(2)}</MutedText>
        </HistoryItem>
      ))}
    </State>
  );
}

function Movements({ id }: { id: number }) {
  const { data, isPending, error } = useMovementHistory(id);

  return (
    <State
      isPending={isPending}
      error={error}
      empty={!isPending && !error && (data?.length ?? 0) === 0}
    >
      {data?.map((movement) => (
        <HistoryItem key={movement.id}>
          <PrimaryText>
            {movement.areaOrigenNombre ?? "Sin área de origen"} →{" "}
            {movement.areaDestinoNombre}
          </PrimaryText>

          <SecondaryText>
            {movement.fechaMovimiento} · Responsable: {movement.username}
          </SecondaryText>

          {movement.motivo && <MutedText>Motivo: {movement.motivo}</MutedText>}
        </HistoryItem>
      ))}
    </State>
  );
}

export default function HistorySection({ assetId }: { assetId: number }) {
  const [tab, setTab] = useState<Tab>("assignments");

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
            </button>
          );
        })}
      </div>

      <div className="min-w-0">
        {tab === "assignments" && <Assignments id={assetId} />}
        {tab === "maintenance" && <Maintenance id={assetId} />}
        {tab === "movements" && <Movements id={assetId} />}
      </div>
    </section>
  );
}
