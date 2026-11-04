import type { DashboardSummary } from "../../types";

import AssetDistributionCard from "./AssetDistributionCard";
import ChartCard from "./ChartCard";
import StatusDonutChart from "./StatusDonutChart";

export default function DashboardCharts({
  summary,
}: {
  summary: DashboardSummary;
}) {
  const { totals } = summary;

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-5">
      <ChartCard title="Activos por estado" className="lg:col-span-2">
        <StatusDonutChart
          operativos={totals.operativos}
          enMantenimiento={totals.enMantenimiento}
          fueraDeServicio={totals.fueraDeServicio}
        />
      </ChartCard>

      <AssetDistributionCard />
    </div>
  );
}
