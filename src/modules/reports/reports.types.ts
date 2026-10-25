export interface DashboardTotals {
  total: number;
  operativos: number;
  enMantenimiento: number;
  fueraDeServicio: number;
  asignados: number;
  /** Operativos y sin asignación abierta. */
  disponibles: number;
  dadosDeBaja: number;
}

export interface CountByName {
  id: number;
  nombre: string;
  total: number;
}

export interface RecentMovement {
  id: number;
  codigoInventario: string;
  areaOrigenNombre: string | null;
  areaDestinoNombre: string;
  username: string;
  fechaMovimiento: string;
}

export interface DashboardSummary {
  totals: DashboardTotals;
  byArea: CountByName[];
  byCategory: CountByName[];
  recentMovements: RecentMovement[];
}

export interface ExportRange {
  desde?: string;
  hasta?: string;
}

export interface OpenAssignmentInfo {
  responsable: string;
  cargo: string;
  desde: string;
}

export interface MovementExportRow {
  fecha: string;
  codigo: string;
  descripcion: string;
  origen: string | null;
  destino: string;
  usuario: string;
  motivo: string | null;
}

export interface MaintenanceExportRow {
  codigo: string;
  descripcion: string;
  tipo: string;
  fecha: string;
  fechaFin: string | null;
  detalle: string;
  observaciones: string | null;
  costo: number;
}

export interface CsvFile {
  filename: string;
  content: string;
}
