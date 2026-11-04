import { Activity, LayoutDashboard } from "lucide-react";

import Alert from "@/shared/components/ui/Alert";
import { LoadingState } from "@/shared/components/ui/states/LoadingState";

// COMPONENTS
import KpiCard from "../components/KpiCard";
import RecentMovements from "../components/RecentMovements";

// HOOKS
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import SectionHeader from "@/shared/components/ui/SectionHeader";

export default function DashboardPage({
  assetHref,
}: {
  assetHref: (codigo: string) => string;
}) {
  const { data, isPending, error } = useDashboardSummary();

  if (isPending) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <section className="space-y-4">
        <SectionHeader
          title="Dashboard"
          description="Resumen general del inventario."
          icon={LayoutDashboard}
        />

        <Alert>
          No se pudo cargar el resumen del inventario: {error.message}
        </Alert>
      </section>
    );
  }

  if (!data) {
    return (
      <Alert>No hay información disponible para mostrar el dashboard.</Alert>
    );
  }

  const { totals, recentMovements } = data;

  return (
    <section className="min-w-0 space-y-6">
      {/* Encabezado */}
      <SectionHeader
        title="DEashboard"
        description="Resumen del estado y la distribución de los activos."
        icon={LayoutDashboard}
      />

      {/* Indicadores KPI */}
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Total de activos" value={totals.total} />

        <KpiCard label="Operativos" value={totals.operativos} tone="green" />

        <KpiCard
          label="Asignados"
          value={totals.asignados}
          tone="blue"
          hint="Con responsable actual"
        />

        <KpiCard
          label="Disponibles para asignar"
          value={totals.disponibles}
          tone="green"
          hint="Operativos y sin responsable"
        />

        <KpiCard
          label="En mantenimiento"
          value={totals.enMantenimiento}
          tone="amber"
        />

        <KpiCard
          label="Fuera de servicio"
          value={totals.fueraDeServicio}
          tone="red"
        />
      </div>

      {/* Actividad reciente */}
      <RecentMovements movements={recentMovements} assetHref={assetHref} />

      {/* Nota de inventario */}
      <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
        <Activity
          size={16}
          className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400"
          aria-hidden="true"
        />
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          Los {totals.dadosDeBaja} activo(s) dado(s) de baja no se incluyen en
          los totales del inventario.
        </p>
      </div>
    </section>
  );
}
