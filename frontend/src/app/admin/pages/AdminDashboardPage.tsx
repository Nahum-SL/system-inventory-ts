import { Suspense } from "react";
import Alert from "@/shared/components/ui/Alert";
import { LoadingState } from "@/shared/components/ui/states/LoadingState";
import {
  DashboardCharts,
  RecentMovements,
  useDashboardSummary,
} from "@/modules/reports";
// COMPONENTS
import { DashboardKpiGrid } from "@/modules/reports/components/stats/dashboard-kpi-grid";
// TYPES
import type { DashboardStats } from "@/modules/reports/types";

const assetHref = (codigo: string) =>
  `/admin/activos/${encodeURIComponent(codigo)}`;

export default function AdminDashboardPage() {
  const { data, isPending, error } = useDashboardSummary();

  if (isPending) {
    return (
      <LoadingState
        message="Compilando analíticas ..."
        messageClassName="uppercase tracking-widest"
      />
    );
  }

  if (error) return <Alert>{error.message}</Alert>;

  const { totals } = data;

  const stats: DashboardStats = {
    activos: totals.total,
    operativo: totals.operativos,
    asignados: totals.asignados,
    disponibles: totals.disponibles,
    en_mantenimiento: totals.enMantenimiento,
    fuera_de_servicio: totals.fueraDeServicio,
  };

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <DashboardKpiGrid stats={stats} />

      <Suspense
        fallback={
          <LoadingState message="Cargando gráficos…" className="py-8" />
        }
      >
        <DashboardCharts summary={data} />
      </Suspense>

      <RecentMovements movements={data.recentMovements} assetHref={assetHref} />

      <p className="text-xs text-slate-400">
        {totals.dadosDeBaja} activo(s) dado(s) de baja no se incluyen en los
        totales.
      </p>
    </section>
  );
}
