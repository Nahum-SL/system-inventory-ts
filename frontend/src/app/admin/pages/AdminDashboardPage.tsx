import Spinner from "@/shared/components/Spinner";
import { useAssets } from "@/modules/assets";
import type { DashboardStats } from "@/shared/types/admin/stats";
import { DashboardKpiGrid } from "../components/stats/dashboard-kpi-grid";
import { LoadingState } from "@/shared/components/states/LoadingState";

export default function AdminDashboardPage() {
  const { data: assets, isPending, error } = useAssets({});

  if (isPending) return <Spinner />;

  if (error) {
    return (
      <p className="rounded-md bg-red-50 p-3 text-red-700">{error.message}</p>
    );
  }

  const stats: DashboardStats = {
    activos: assets.length,
    operativo: assets.filter((asset) => asset.estado === "operativo").length,
    en_mantenimiento: assets.filter((asset) => asset.estado === "mantenimiento")
      .length,
    fuera_de_servicio: assets.filter(
      (asset) => asset.estado === "fuera_de_servicio",
    ).length,
  };

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {isPending ? (
        <LoadingState
          message="Compilando analíticas ..."
          messageClassName="uppercase tracking-widest"
        />
      ) : (
        stats && (
          <>
            {/* Grid Atómico de KPIs cuantitativas */}
            <DashboardKpiGrid stats={stats} />
          </>
        )
      )}{" "}
    </section>
  );
}
