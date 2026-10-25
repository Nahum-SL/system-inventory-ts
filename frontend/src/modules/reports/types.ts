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

export interface DashboardSummary {
  totals: DashboardTotals;
  byArea: CountByName[];
  byCategory: CountByName[];
  recentMovements: RecentMovement[];
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
