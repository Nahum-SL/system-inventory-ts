import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  operativos: number;
  enMantenimiento: number;
  fueraDeServicio: number;
}

export default function StatusDonutChart({
  operativos,
  enMantenimiento,
  fueraDeServicio,
}: Props) {
  const data = [
    { name: "Operativo", value: operativos, fill: "#059669" },
    { name: "En mantenimiento", value: enMantenimiento, fill: "#d97706" },
    { name: "Fuera de servicio", value: fueraDeServicio, fill: "#dc2626" },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        No hay datos disponibles para este gráfico.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:gap-2">
      <div
        role="img"
        aria-label={`Activos por estado: ${data.map((item) => `${item.name} ${item.value}`).join(", ")}`}
        className="relative h-52 w-full min-w-0 sm:w-1/2"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter((item) => item.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={3}
              stroke="none"
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                color: "#1e293b",
                fontSize: 12,
                boxShadow: "0 4px 12px rgb(15 23 42 / 0.08)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {total}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Activos
          </span>
        </div>
      </div>

      <ul className="w-full space-y-3 sm:w-1/2">
        {data.map((item) => (
          <li
            key={item.name}
            className="flex min-w-0 items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.fill }}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </span>

            <span className="shrink-0 font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
