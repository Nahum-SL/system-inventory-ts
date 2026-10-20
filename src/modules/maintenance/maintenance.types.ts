export interface Maintenance {
  // ...los campos actuales
  fechaFin: string | null; // null = mantenimiento abierto
}

export interface CloseMaintenanceData {
  fechaFin: string;
  resultado: "operativo" | "fuera_de_servicio";
  observaciones?: string;
  costo?: number;
}

export type CreateMaintenanceResult =
  | { status: "ok"; maintenance: Maintenance }
  | { status: "asset_not_found" }
  | { status: "already_open" };

export type CloseMaintenanceResult =
  | { status: "ok"; maintenance: Maintenance }
  | { status: "not_found" }
  | { status: "already_closed" }
  | { status: "invalid_dates" };
