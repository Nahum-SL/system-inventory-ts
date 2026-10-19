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
  descripcion: string;
  observaciones: string | null;
  costo: number;
  fechaRegistro: string;
}
