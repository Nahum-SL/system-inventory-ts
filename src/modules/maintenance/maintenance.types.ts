/**
 * Solo habra 2 tipos de mantenimiento: preventivo - correctivo
 */
export type MaintenanceType = "preventivo" | "correctivo";

/**
 * Interfaz para crear un nuevo registro en Mantenimiento
 */
export interface CreateMaintenanceData {
  activoId: number;
  tipo: MaintenanceType;
  fecha: string;
  descripcion: string;
  observaciones?: string;
  costo: number;
}

/**
 * Datos de Mantenimiento
 */
export interface Maintenance {
  id: number;
  activoId: number;
  codigoInventario: string;
  tipo: MaintenanceType;
  fecha: string;
  fechaFin: string | null;
  descripcion: string;
  observaciones: string | null;
  costo: number;
  fechaRegistro: string;
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
