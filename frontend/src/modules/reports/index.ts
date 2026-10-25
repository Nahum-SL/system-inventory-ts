import { lazy } from "react";

// recharts es pesado: se descarga solo al abrir el dashboard, no en la vista del escáner.
export const DashboardCharts = lazy(
  () => import("./components/charts/DashboardCharts"),
);

export { default as RecentMovements } from "./components/RecentMovements";
export { useDashboardSummary, reportKeys } from "./hooks/useDashboardSummary";
export type { DashboardSummary, DashboardTotals } from "./types";
