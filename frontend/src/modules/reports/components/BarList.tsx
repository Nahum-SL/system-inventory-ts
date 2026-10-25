import type { CountByName } from "../types";

export default function BarList({
  title,
  items,
}: {
  title: string;
  items: CountByName[];
}) {
  const max = Math.max(1, ...items.map((i) => i.total));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Sin datos.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span className="truncate">{item.nombre}</span>
                <span className="font-semibold">{item.total}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(item.total / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
