import Spinner from "@/shared/components/Spinner";
import { STATUS_LABELS, useAssets, type AssetStatus } from "@/modules/assets";

export default function AdminDashboardPage() {
  const { data, isPending, error } = useAssets({});

  if (isPending) return <Spinner />;
  if (error)
    return (
      <p className="rounded-md bg-red-50 p-3 text-red-700">{error.message}</p>
    );

  const count = (s: AssetStatus) => data.filter((a) => a.estado === s).length;

  const cards = [
    { label: "Total de activos", value: data.length },
    ...(Object.keys(STATUS_LABELS) as AssetStatus[]).map((s) => ({
      label: STATUS_LABELS[s],
      value: count(s),
    })),
  ];

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
