import { cn } from "@/shared/lib/utils";
import type { CountByName } from "../types";

export default function BarList({
  title,
  items,
}: {
  title: string;
  items: CountByName[];
}) {
  const max = Math.max(1, ...items.map((item) => item.total));
  const hasValues = items.some((item) => item.total > 0);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5">
      <h2 className="mb-5 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h2>

      {items.length === 0 || !hasValues ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No hay datos disponibles.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const percentage = (item.total / max) * 100;

            return (
              <li key={item.id} className="min-w-0">
                <div className="mb-2 flex min-w-0 items-center justify-between gap-3 text-sm">
                  <span
                    className="min-w-0 truncate text-slate-600 dark:text-slate-300"
                    title={item.nombre}
                  >
                    {item.nombre}
                  </span>

                  <span className="shrink-0 font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {item.total.toLocaleString("es-PE")}
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800"
                  role="progressbar"
                  aria-label={item.nombre}
                  aria-valuenow={item.total}
                  aria-valuemin={0}
                  aria-valuemax={max}
                >
                  <div
                    className={cn(
                      "h-full rounded-full bg-amber-500 transition-[width] duration-500",
                      "dark:bg-amber-400",
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
