import {
  Ban,
  CheckCircle,
  Package,
  PackageCheck,
  UserCheck,
  Wrench,
} from "lucide-react";

import { buildAssetsLink } from "@/modules/assets";

// TYPES
import type { DashboardStats, KpiItemConfig } from "../../types";

const ASSETS_PATH = "/admin/activos";

export function getKpiItemsConfig(stats: DashboardStats): KpiItemConfig[] {
  return [
    {
      title: "Total de activos",
      value: stats.activos,
      icon: Package,
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
      link: buildAssetsLink(ASSETS_PATH),
    },
    {
      title: "Operativos",
      value: stats.operativo,
      icon: CheckCircle,
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      link: buildAssetsLink(ASSETS_PATH, {
        estado: "operativo",
      }),
    },
    {
      title: "Asignados",
      value: stats.asignados,
      icon: UserCheck,
      color: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/50",
      link: buildAssetsLink(ASSETS_PATH, {
        asignacion: "asignado",
      }),
    },
    {
      title: "Disponibles para asignar",
      value: stats.disponibles,
      icon: PackageCheck,
      color: "text-teal-700 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/50",
      link: buildAssetsLink(ASSETS_PATH, {
        estado: "operativo",
        asignacion: "libre",
      }),
    },
    {
      title: "En mantenimiento",
      value: stats.en_mantenimiento,
      icon: Wrench,
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
      link: buildAssetsLink(ASSETS_PATH, {
        estado: "mantenimiento",
      }),
    },
    {
      title: "Fuera de servicio",
      value: stats.fuera_de_servicio,
      icon: Ban,
      color: "text-red-700 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/50",
      link: buildAssetsLink(ASSETS_PATH, {
        estado: "fuera_de_servicio",
      }),
    },
  ];
}
