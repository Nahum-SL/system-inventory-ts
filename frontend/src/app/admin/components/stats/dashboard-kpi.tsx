// src/features/admin/dashboard/stats/utils/dashboard-kpi.ts
import { Package, CheckCircle, Wrench, Ban } from "lucide-react";
import type { DashboardStats } from "@/shared/types/admin/stats";
import type { KpiItemConfig } from "@/shared/types/admin/stats";

export function getKpiItemsConfig(stats: DashboardStats): KpiItemConfig[] {
  return [
    {
      title: "Total de activos",
      value: stats.activos,
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      link: "/admin/activos",
    },
    {
      title: "Operativo",
      value: stats.operativo,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      link: "/admin/activos",
    },
    {
      title: "En mantenimiento",
      value: stats.en_mantenimiento,
      icon: Wrench,
      color: "text-amber-600",
      bg: "bg-amber-50",
      link: "/admin/activos",
    },
    {
      title: "Fuera de servicio",
      value: stats.fuera_de_servicio,
      icon: Ban,
      color: "text-red-600",
      bg: "bg-red-50",
      link: "/admin/activos",
    },
  ];
}
