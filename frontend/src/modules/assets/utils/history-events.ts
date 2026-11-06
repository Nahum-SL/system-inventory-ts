// UTILS
import { titleCase } from "@/shared/lib/date/format";
// HOOKS
import type {
  useAssignmentHistory,
  useMaintenanceHistory,
  useMovementHistory,
} from "../hooks/useAssetHistory";

export type HistoryKind = "asignacion" | "mantenimiento" | "traslado";

export interface HistoryEvent {
  id: string;
  kind: HistoryKind;
  /** Fecha ISO para ordenar. */
  sortKey: string;
  title: string;
  subtitle?: string;
  start: string;
  /** undefined: ocurre en un instante (traslado) · null: periodo todavía abierto. */
  end?: string | null;
  notes: { label: string; value: string }[];
}

type Assignments = NonNullable<ReturnType<typeof useAssignmentHistory>["data"]>;
type Maintenances = NonNullable<
  ReturnType<typeof useMaintenanceHistory>["data"]
>;
type Movements = NonNullable<ReturnType<typeof useMovementHistory>["data"]>;

interface Sources {
  assignments?: Assignments;
  maintenance?: Maintenances;
  movements?: Movements;
}

/** Une los tres historiales en una sola línea de tiempo, del más reciente al más antiguo. */
export function buildHistoryEvents({
  assignments = [],
  maintenance = [],
  movements = [],
}: Sources): HistoryEvent[] {
  const events: HistoryEvent[] = [
    ...assignments.map(
      (a): HistoryEvent => ({
        id: `asignacion-${a.id}`,
        kind: "asignacion",
        sortKey: a.fechaInicio,
        title: `Asignado a ${titleCase(a.personaNombre)}`,
        subtitle: a.cargoNombre,
        start: a.fechaInicio,
        end: a.fechaFin ?? null,
        notes: [
          ...(a.condicionEntrega
            ? [{ label: "Condición de entrega", value: a.condicionEntrega }]
            : []),
          ...(a.condicionDevolucion
            ? [
                {
                  label: "Condición de devolución",
                  value: a.condicionDevolucion,
                },
              ]
            : []),
        ],
      }),
    ),

    ...maintenance.map(
      (m): HistoryEvent => ({
        id: `mantenimiento-${m.id}`,
        kind: "mantenimiento",
        sortKey: m.fecha,
        title: m.descripcion,
        subtitle: `Tipo: ${m.tipo}`,
        start: m.fecha,
        end: m.fechaFin ?? null,
        notes: m.observaciones
          ? [{ label: "Observaciones", value: m.observaciones }]
          : [],
      }),
    ),

    ...movements.map(
      (m): HistoryEvent => ({
        id: `traslado-${m.id}`,
        kind: "traslado",
        sortKey: m.fechaMovimiento,
        title: `${m.areaOrigenNombre ?? "Sin área de origen"} → ${m.areaDestinoNombre}`,
        start: m.fechaMovimiento,
        notes: [
          { label: "Registrado por", value: m.username },
          ...(m.motivo ? [{ label: "Motivo", value: m.motivo }] : []),
        ],
      }),
    ),
  ];

  return events.sort(
    (a, b) => b.sortKey.localeCompare(a.sortKey) || a.id.localeCompare(b.id),
  );
}
