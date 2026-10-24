// src/features/admin/dashboard/stats/components/dashboard-kpi-grid.tsx
import type { DashboardStats } from "@/shared/types/admin/stats";
import { DashboardKpiCard } from "./dashboard-kpi-stats";
import { getKpiItemsConfig } from "./dashboard-kpi";

interface DashboardKpiGridProps {
  stats: DashboardStats;
}

export function DashboardKpiGrid({ stats }: DashboardKpiGridProps) {
  const kpiItems = getKpiItemsConfig(stats);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiItems.map((kpi) => (
        <DashboardKpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
