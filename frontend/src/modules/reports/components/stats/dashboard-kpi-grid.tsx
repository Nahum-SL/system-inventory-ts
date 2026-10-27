// src/features/admin/dashboard/stats/components/dashboard-kpi-grid.tsx
import type { DashboardStats } from "../../types";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { getKpiItemsConfig } from "./dashboard-kpi";

interface DashboardKpiGridProps {
  stats: DashboardStats;
}

export function DashboardKpiGrid({ stats }: DashboardKpiGridProps) {
  const kpiItems = getKpiItemsConfig(stats);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {kpiItems.map((kpi) => (
        <DashboardKpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
