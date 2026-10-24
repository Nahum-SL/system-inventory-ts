import type { LucideIcon } from "lucide-react";

// export interface DashboardChartItem {
//   day: string;
//   value: number;
// }

export interface DashboardStats {
  activos: number;
  operativo: number;
  en_mantenimiento: number;
  fuera_de_servicio: number;
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
