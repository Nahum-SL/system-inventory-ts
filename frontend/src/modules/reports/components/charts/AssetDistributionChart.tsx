import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DistributionSummary } from "../../types";

// Un color fijo por posición en la leyenda (la leyenda ya viene ordenada del servidor).
const PALETTE = [
  "#d97706",
  "#2563eb",
  "#059669",
  "#8b5cf6",
  "#e11d48",
  "#0891b2",
  "#65a30d",
  "#64748b",
];
const ROW_HEIGHT = 56;
const AXIS_WIDTH = 170;

interface Props {
  data: DistributionSummary;
  /** Ids de categoría en el orden que fija el color; por defecto, el de la leyenda. */
  paletteOrder?: number[];
}

export function AssetDistributionChart({ data, paletteOrder }: Props) {
  const { categorias, areas } = data;

  if (areas.length === 0) {
    return (
      <p className="py-8 text-center text-sm opacity-70">
        No hay activos para este filtro.
      </p>
    );
  }

  const order = paletteOrder ?? categorias.map((c) => c.id);
  
  const colorOf = new Map(
    categorias.map((c) => {
      const pos = order.indexOf(c.id);
      return [
        c.id,
        PALETTE[(pos === -1 ? order.length : pos) % PALETTE.length]!,
      ];
    }),
  );

  const totalByArea = new Map(areas.map((a) => [a.nombre, a.total]));

  // Una fila por área; todas las categorías con 0 por defecto para que el apilado sea estable.
  const rows = areas.map((area) => {
    const row: Record<string, number | string> = { nombre: area.nombre };
    for (const c of categorias) row[`c${c.id}`] = 0;
    for (const c of area.categorias) row[`c${c.id}`] = c.total;
    return row;
  });

  return (
    <div>
      <div
        role="img"
        aria-label={`Distribución de ${data.total} activos por área y categoría`}
        style={{ height: areas.length * ROW_HEIGHT + 8 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            stackOffset="expand"
            margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
            barCategoryGap={14}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="nombre"
              width={AXIS_WIDTH}
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={({ x, y, payload }) => (
                <AreaTick
                  x={x}
                  y={y}
                  name={String(payload.value)}
                  total={totalByArea.get(String(payload.value)) ?? 0}
                />
              )}
            />
            <Tooltip
              cursor={{ fill: "currentColor", fillOpacity: 0.05 }}
              content={<DistributionTooltip />}
            />
            {categorias.map((c) => (
              <Bar
                key={c.id}
                dataKey={`c${c.id}`}
                name={c.nombre}
                stackId="area"
                fill={colorOf.get(c.id)}
                isAnimationActive={false}
              >
                <LabelList dataKey={`c${c.id}`} content={SegmentLabel} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda en HTML: accesible y con el total de cada categoría */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {categorias.map((c) => (
          <li key={c.id} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ background: colorOf.get(c.id) }}
            />
            {c.nombre}
            <span className="opacity-60">{c.total}</span>
          </li>
        ))}
      </ul>

      {/* Equivalente textual para lectores de pantalla */}
      <table className="sr-only">
        <caption>Activos por área y categoría</caption>
        <thead>
          <tr>
            <th>Área</th>
            {categorias.map((c) => (
              <th key={c.id}>{c.nombre}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {areas.map((a) => (
            <tr key={a.id}>
              <th>{a.nombre}</th>
              {categorias.map((c) => (
                <td key={c.id}>
                  {a.categorias.find((x) => x.id === c.id)?.total ?? 0}
                </td>
              ))}
              <td>{a.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Nombre del área en negrita y, debajo, su total. */
function AreaTick({
  x = 0,
  y = 0,
  name,
  total,
}: {
  x?: number | string;
  y?: number | string;
  name: string;
  total: number;
}) {
  const label = name.length > 22 ? `${name.slice(0, 21)}…` : name;
  return (
    <g transform={`translate(${Number(x)},${Number(y)})`} fill="currentColor">
      <text x={-10} y={-3} textAnchor="end" fontSize={13} fontWeight={600}>
        {label}
      </text>
      <text x={-10} y={13} textAnchor="end" fontSize={12} opacity={0.6}>
        {total} {total === 1 ? "activo" : "activos"}
      </text>
    </g>
  );
}

/** Número dentro del segmento; se omite si el segmento es muy angosto o vale 0. */
function SegmentLabel(props: {
  x?: unknown;
  y?: unknown;
  width?: unknown;
  height?: unknown;
  value?: unknown;
}) {
  const x = Number(props.x);
  const y = Number(props.y);
  const w = Number(props.width);
  const h = Number(props.height);
  if (!props.value || !(w >= 26)) return null;

  return (
    <text
      x={x + w / 2}
      y={y + h / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#fff"
      fontSize={12}
      fontWeight={600}
    >
      {String(props.value)}
    </text>
  );
}

function DistributionTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
}) {
  const items = (payload ?? []).filter((p) => (p.value ?? 0) > 0);
  if (!active || items.length === 0) return null;
  const total = items.reduce((n, p) => n + (p.value ?? 0), 0);
  return (
    <div className="rounded-md border bg-white px-3 py-2 text-sm shadow-md dark:bg-neutral-900">
      <p className="mb-1 font-semibold">
        {label} · {total}
      </p>
      {items.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: p.color }}
          />
          {p.name}: <strong>{p.value}</strong>
          <span className="opacity-60">
            ({Math.round(((p.value ?? 0) / total) * 100)} %)
          </span>
        </p>
      ))}
    </div>
  );
}
