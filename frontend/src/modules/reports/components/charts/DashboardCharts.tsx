// UTIL
import { groupTop } from "../../utils/group-top";
// TYPES
import type { DashboardSummary } from "../../types";
// CHARTS - GRAFICOS
import ChartCard from "./ChartCard";
import CountBarChart from "./CountBarChart";
import StatusDonutChart from "./StatusDonutChart";

export default function DashboardCharts({
  summary,
}: {
  summary: DashboardSummary;
}) {
  const { totals, byArea, byCategory } = summary;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Activos por estado">
        <StatusDonutChart
          operativos={totals.operativos}
          enMantenimiento={totals.enMantenimiento}
          fueraDeServicio={totals.fueraDeServicio}
        />
      </ChartCard>

      <ChartCard title="Activos por área">
        <CountBarChart items={groupTop(byArea)} label="Activos por área" />
      </ChartCard>

      <ChartCard title="Activos por categoría" className="lg:col-span-2">
        <CountBarChart
          items={groupTop(byCategory)}
          label="Activos por categoría"
        />
      </ChartCard>
    </div>
  );
}
