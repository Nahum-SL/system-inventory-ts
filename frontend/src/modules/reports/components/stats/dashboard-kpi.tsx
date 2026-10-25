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
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      link: buildAssetsLink(ASSETS_PATH),
    },
    {
      title: "Operativo",
      value: stats.operativo,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      link: buildAssetsLink(ASSETS_PATH, { estado: "operativo" }),
    },
    {
      title: "Asignados",
      value: stats.asignados,
      icon: UserCheck,
      color: "text-sky-600",
      bg: "bg-sky-50",
      link: buildAssetsLink(ASSETS_PATH, { asignacion: "asignado" }),
    },
    {
      title: "Disponibles para asignar",
      value: stats.disponibles,
      icon: PackageCheck,
      color: "text-teal-600",
      bg: "bg-teal-50",
      link: buildAssetsLink(ASSETS_PATH, {
        estado: "operativo",
        asignacion: "libre",
      }),
    },
    {
      title: "En mantenimiento",
      value: stats.en_mantenimiento,
      icon: Wrench,
      color: "text-amber-600",
      bg: "bg-amber-50",
      link: buildAssetsLink(ASSETS_PATH, { estado: "mantenimiento" }),
    },
    {
      title: "Fuera de servicio",
      value: stats.fuera_de_servicio,
      icon: Ban,
      color: "text-red-600",
      bg: "bg-red-50",
      link: buildAssetsLink(ASSETS_PATH, { estado: "fuera_de_servicio" }),
    },
  ];
}
