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
