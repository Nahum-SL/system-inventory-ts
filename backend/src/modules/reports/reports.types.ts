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
}

export interface CsvFile {
  filename: string;
  content: string;
}

// =============================
// PARA LAS GRAFICOS DEL DASHBOARD
// =============================
export interface DashboardSummary {
  totals: DashboardTotals;
  byArea: CountByName[];
  byCategory: CountByName[];
  recentMovements: RecentMovement[];
}

export interface DistributionFilters {
  areaId?: number;
  categoriaId?: number;
  estado?: "operativo" | "mantenimiento" | "fuera_de_servicio";
}

/** Una celda de la matriz área × categoría (salida cruda del repositorio). */
export interface DistributionCell {
  areaId: number;
  areaNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  total: number;
}

export interface AreaDistribution {
  id: number;
  nombre: string;
  total: number;
  categorias: CountByName[];
}

export interface DistributionSummary {
  total: number;
  /** Leyenda global, de mayor a menor. */
  categorias: CountByName[];
  areas: AreaDistribution[];
}
