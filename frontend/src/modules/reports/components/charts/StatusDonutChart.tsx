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

  if (data.every((d) => d.value === 0))
    return <p className="text-sm text-slate-500">Sin datos.</p>;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div
        role="img"
        aria-label={`Activos por estado: ${data.map((d) => `${d.name} ${d.value}`).join(", ")}`}
        className="h-52 w-full sm:w-1/2"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full space-y-2 text-sm sm:w-1/2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: d.fill }}
              />
              {d.name}
            </span>
            <span className="font-semibold">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
