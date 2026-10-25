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
  if (items.length === 0 || items.every((i) => i.total === 0)) {
    return <p className="text-sm text-slate-500">Sin datos.</p>;
  }

  return (
    <div
      role="img"
      aria-label={`${label}: ${items.map((i) => `${i.nombre} ${i.total}`).join(", ")}`}
      style={{ height: Math.max(160, items.length * ROW_HEIGHT + 40) }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={items}
          layout="vertical"
          margin={{ top: 0, right: 28, bottom: 0, left: 0 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="nombre"
            width={110}
            tick={{ fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: "#f1f5f9" }} />
          <Bar
            dataKey="total"
            name="Activos"
            fill="#4f46e5"
            radius={[0, 6, 6, 0]}
          >
            <LabelList dataKey="total" position="right" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
