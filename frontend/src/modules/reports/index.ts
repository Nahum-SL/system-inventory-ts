import { lazy } from "react";

// recharts es pesado: se descarga solo al abrir el dashboard, no en la vista del escáner.
export const DashboardCharts = lazy(
  () => import("./components/charts/DashboardCharts"),
);
// HOOKS
export { useDashboardSummary, reportKeys } from "./hooks/useDashboardSummary";
// TYpes
export type { DashboardSummary, DashboardTotals } from "./types";
// COMPONENTS
export { default as RecentMovements } from "./components/RecentMovements";
export { default as ExportAssetsButton } from "./components/ExportAssetsButton";
// VIEWS - PAGES
export { default as ReportsPage } from "./views/ReportsPage";