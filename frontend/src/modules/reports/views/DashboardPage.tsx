import Alert from "@/shared/components/ui/Alert";
import Spinner from "@/shared/components/Spinner";
// COMPONENTS
import BarList from "../components/BarList";
import KpiCard from "../components/KpiCard";
import RecentMovements from "../components/RecentMovements";
// HOOKS
import { useDashboardSummary } from "../hooks/useDashboardSummary";

export default function DashboardPage({
  assetHref,
}: {
  assetHref: (codigo: string) => string;
}) {
  const { data, isPending, error } = useDashboardSummary();

  if (isPending) return <Spinner />;
  if (error) return <Alert>{error.message}</Alert>;

  const { totals, byArea, byCategory, recentMovements } = data;

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <BarList title="Activos por área" items={byArea} />
        <BarList title="Activos por categoría" items={byCategory} />
      </div>

      <RecentMovements movements={recentMovements} assetHref={assetHref} />

      <p className="text-xs text-slate-400">
        {totals.dadosDeBaja} activo(s) dado(s) de baja no se incluyen en los
        totales.
      </p>
    </section>
  );
}
