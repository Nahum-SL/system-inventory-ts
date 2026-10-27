import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CountByName } from "../../types";

const ROW_HEIGHT = 36;

export default function CountBarChart({
  items,
  label,
}: {
  items: CountByName[];
  label: string;
}) {
  if (items.length === 0 || items.every((item) => item.total === 0)) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        No hay datos disponibles para este gráfico.
      </p>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${label}: ${items.map((item) => `${item.nombre} ${item.total}`).join(", ")}`}
      style={{ height: Math.max(180, items.length * ROW_HEIGHT + 40) }}
      className="min-w-0 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={items}
          layout="vertical"
          margin={{ top: 4, right: 28, bottom: 4, left: 4 }}
        >
          <CartesianGrid
            horizontal={false}
            stroke="#cbd5e1"
            strokeDasharray="3 3"
            className="dark:opacity-30"
          />

          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="nombre"
            width={110}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            cursor={{ fill: "#f1f5f9", fillOpacity: 0.7 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              fontSize: 12,
              boxShadow: "0 4px 12px rgb(15 23 42 / 0.08)",
            }}
          />

          <Bar
            dataKey="total"
            name="Activos"
            fill="#d97706"
            maxBarSize={24}
            radius={[0, 6, 6, 0]}
          >
            <LabelList
              dataKey="total"
              position="right"
              fill="#64748b"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
