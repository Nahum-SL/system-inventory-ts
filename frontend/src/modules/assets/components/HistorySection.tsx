
import { useMemo, type ReactNode } from "react";
import {
  ArrowLeftRight,
  History,
  RotateCcw,
  UserRoundPlus,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { formatDate, titleCase } from "@/shared/lib/date/format";
import { LoadingState } from "@/shared/components/ui/states/LoadingState";

import {
  useAssignmentHistory,
  useMaintenanceHistory,
  useMovementHistory,
} from "../hooks/useAssetHistory";

type EventType =
  | "assignment"
  | "return"
  | "maintenance"
  | "movement";

interface TimelineEvent {
  id: string;
  type: EventType;
  date: string;
  title: string;
  details: ReactNode;
  active?: boolean;
}

const EVENT_STYLES: Record<
  EventType,
  {
    label: string;
    Icon: LucideIcon;
    dot: string;
    icon: string;
    badge: string;
  }
> = {
  assignment: {
    label: "Asignación",
    Icon: UserRoundPlus,
    dot: "bg-violet-400",
    icon: "text-violet-400",
    badge:
      "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  return: {
    label: "Devolución",
    Icon: RotateCcw,
    dot: "bg-blue-400",
    icon: "text-blue-400",
    badge:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  maintenance: {
    label: "Mantenimiento",
    Icon: Wrench,
    dot: "bg-emerald-400",
    icon: "text-emerald-400",
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  movement: {
    label: "Traslado",
    Icon: ArrowLeftRight,
    dot: "bg-amber-400",
    icon: "text-amber-400",
    badge:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

function EmptyState() {
  return (
    <div
      className="
        flex flex-col items-center gap-3
        rounded-xl border border-dashed
        border-slate-200 px-4 py-10
        text-center dark:border-[#34415f]
      "
    >
      <History
        size={32}
        className="text-slate-400"
        aria-hidden="true"
      />

      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Todavía no hay movimientos
      </p>

      <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
        Las asignaciones, devoluciones, mantenimientos y
        traslados aparecerán aquí automáticamente.
      </p>
    </div>
  );
}

function TimelineItem({
  event,
  last,
}: {
  event: TimelineEvent;
  last: boolean;
}) {
  const style = EVENT_STYLES[event.type];
  const Icon = style.Icon;

  return (
    <li className="relative pl-8 pb-4 last:pb-0">
      {/* LÍNEA VERTICAL */}
      {!last && (
        <span
          aria-hidden="true"
          className="
            absolute left-[7px] top-5 bottom-0
            w-px bg-slate-200 dark:bg-[#34415f]
          "
        />
      )}

      {/* PUNTO DEL MOVIMIENTO */}
      <span
        aria-hidden="true"
        className={`
          absolute left-0 top-5 size-3.5
          rounded-full border-[3px]
          border-white dark:border-[#1e2943]
          ${style.dot}
        `}
      />

      {/* TARJETA */}
      <article
        className="
          min-w-0 rounded-xl border
          border-slate-200 bg-slate-50
          p-4 transition-colors
          hover:border-indigo-300
          dark:border-[#34415f]
          dark:bg-[#202b45]
          dark:hover:border-indigo-500/50
        "
      >
        <div className="flex items-start gap-3">
          <div
            className={`
              flex size-10 shrink-0 items-center
              justify-center rounded-xl
              bg-slate-200/70 dark:bg-[#2c3955]
              ${style.icon}
            `}
          >
            <Icon size={19} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`
                  inline-flex rounded-full px-2.5 py-1
                  text-xs font-semibold ${style.badge}
                `}
              >
                {style.label}
              </span>

              <time className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(event.date)}
              </time>
            </div>

            <h3
              className="
                break-words text-sm font-semibold
                text-slate-900 dark:text-white
              "
            >
              {event.title}
            </h3>

            <div className="space-y-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
              {event.details}
            </div>

            {event.active && (
              <span
                className="
                  inline-flex rounded-full
                  bg-emerald-500/10 px-2 py-1
                  text-xs font-medium
                  text-emerald-700 dark:text-emerald-300
                "
              >
                En curso
              </span>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

export default function HistorySection({
  assetId,
}: {
  assetId: number;
}) {
  const assignments = useAssignmentHistory(assetId);
  const maintenance = useMaintenanceHistory(assetId);
  const movements = useMovementHistory(assetId);

  const isPending =
    assignments.isPending ||
    maintenance.isPending ||
    movements.isPending;

  const errors = [
    assignments.error,
    maintenance.error,
    movements.error,
  ].filter((error): error is Error => error instanceof Error);

  const events = useMemo<TimelineEvent[]>(() => {
    const result: TimelineEvent[] = [];

    // ASIGNACIONES Y DEVOLUCIONES
    for (const assignment of assignments.data ?? []) {
      result.push({
        id: `assignment-${assignment.id}`,
        type: "assignment",
        date: assignment.fechaInicio,
        title: `Asignado a ${titleCase(assignment.personaNombre)}`,
        active: !assignment.fechaFin,
        details: (
          <>
            <p>Cargo: {assignment.cargoNombre}</p>

            {assignment.condicionEntrega && (
              <p>
                Condición de entrega:{" "}
                {assignment.condicionEntrega}
              </p>
            )}
          </>
        ),
      });

      // Si hay fecha de devolución, creamos
      // un evento independiente en la línea de tiempo.
      if (assignment.fechaFin) {
        result.push({
          id: `return-${assignment.id}`,
          type: "return",
          date: assignment.fechaFin,
          title: `Devuelto por ${titleCase(
            assignment.personaNombre,
          )}`,
          details: (
            <>
              <p>Cargo: {assignment.cargoNombre}</p>

              {assignment.condicionDevolucion && (
                <p>
                  Condición de devolución:{" "}
                  {assignment.condicionDevolucion}
                </p>
              )}
            </>
          ),
        });
      }
    }

    // MANTENIMIENTOS
    for (const item of maintenance.data ?? []) {
      result.push({
        id: `maintenance-${item.id}`,
        type: "maintenance",
        date: item.fecha,
        title: item.descripcion,
        active: !item.fechaFin,
        details: (
          <>
            <p>Tipo: {item.tipo}</p>

            {item.fechaFin && (
              <p>
                Finalizado: {formatDate(item.fechaFin)}
              </p>
            )}

            {item.observaciones && (
              <p>Observaciones: {item.observaciones}</p>
            )}
          </>
        ),
      });
    }

    // TRASLADOS
    for (const item of movements.data ?? []) {
      result.push({
        id: `movement-${item.id}`,
        type: "movement",
        date: item.fechaMovimiento,
        title: `${
          item.areaOrigenNombre ?? "Sin área de origen"
        } → ${item.areaDestinoNombre}`,
        details: (
          <>
            <p>Registrado por: {item.username}</p>

            {item.motivo && (
              <p>Motivo: {item.motivo}</p>
            )}
          </>
        ),
      });
    }

    // MÁS RECIENTES PRIMERO
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      return dateB - dateA;
    });

    return result;
  }, [
    assignments.data,
    maintenance.data,
    movements.data,
  ]);

  return (
    <section
      aria-labelledby="asset-history-title"
      className="min-w-0"
    >
      {/* ENCABEZADO */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History
              size={19}
              className="text-indigo-500 dark:text-indigo-400"
              aria-hidden="true"
            />

            <h2
              id="asset-history-title"
              className="text-base font-semibold text-slate-900 dark:text-white"
            >
              Historial del activo
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Movimientos ordenados del más reciente al más antiguo.
          </p>
        </div>

        {!isPending && errors.length === 0 && (
          <span
            className="
              rounded-full bg-slate-100 px-3 py-1
              text-xs font-medium text-slate-600
              dark:bg-[#2c3955] dark:text-slate-200
            "
          >
            {events.length}{" "}
            {events.length === 1 ? "registro" : "registros"}
          </span>
        )}
      </div>

      {/* CARGA */}
      {isPending && (
        <div role="status" aria-label="Cargando historial">
          <LoadingState />
        </div>
      )}

      {/* ERRORES */}
      {!isPending && errors.length > 0 && (
        <div
          role="alert"
          className="
            rounded-xl border border-red-500/30
            bg-red-500/10 p-4
            text-sm text-red-600 dark:text-red-300
          "
        >
          No se pudo cargar el historial completo.
          {errors.map((error, index) => (
            <p key={index} className="mt-1">
              {error.message}
            </p>
          ))}
        </div>
      )}

      {/* SIN MOVIMIENTOS */}
      {!isPending && errors.length === 0 && events.length === 0 && (
        <EmptyState />
      )}

      {/* LÍNEA DE TIEMPO */}
      {!isPending && errors.length === 0 && events.length > 0 && (
        <ol className="min-w-0">
          {events.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              last={index === events.length - 1}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
