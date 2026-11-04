import type { LucideIcon } from "lucide-react";

export interface DashboardTotals {
  total: number;
  operativos: number;
  enMantenimiento: number;
  fueraDeServicio: number;
  asignados: number;
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

export interface DashboardStats {
  activos: number;
  operativo: number;
  asignados: number;
  en_mantenimiento: number;
  fuera_de_servicio: number;
  disponibles: number;
  // chartData: DashboardChartItem[];
}

export interface KpiItemConfig {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  bgHover?: string;
  link: string;
}

export interface AssetExportFilters {
  q?: string;
  estado?: string;
  asignacion?: string;
}

export interface DateRange {
  desde?: string;
  hasta?: string;
}

// ==================
// GRAFICOS DE DISTRIBUCION DE ACTIVOS

export interface DashboardSummary {
  totals: DashboardTotals;
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
