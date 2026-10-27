import { ArrowRightLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { Link } from "react-router";

import type { RecentMovement } from "../types";

interface Props {
  movements: RecentMovement[];
  assetHref: (codigo: string) => string;
}

export default function RecentMovements({ movements, assetHref }: Props) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 dark:border-gray-800 sm:px-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <ArrowRightLeft size={19} aria-hidden="true" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Últimos traslados
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Movimientos registrados recientemente.
          </p>
        </div>
      </div>

      {movements.length === 0 ? (
        <div className="px-4 py-10 text-center sm:px-5">
          <Clock3
            size={25}
            className="mx-auto mb-3 text-slate-400"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Aún no hay traslados
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Los movimientos registrados aparecerán aquí.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-gray-800">
          {movements.map((movement) => (
            <li
              key={movement.id}
              className="flex min-w-0 items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/50 sm:px-5"
            >
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                <ArrowRightLeft size={16} aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  to={assetHref(movement.codigoInventario)}
                  className="inline-flex max-w-full items-center gap-1 font-mono text-sm font-semibold text-amber-700 hover:text-amber-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  <span className="break-all">{movement.codigoInventario}</span>
                  <ArrowUpRight
                    size={14}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                </Link>

                <p className="mt-1 wrap-break-word text-sm leading-5 text-slate-600 dark:text-slate-300">
                  <span>{movement.areaOrigenNombre ?? "—"}</span>
                  <span className="mx-2 text-slate-400" aria-hidden="true">
                    →
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {movement.areaDestinoNombre}
                  </span>
                </p>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {movement.fechaMovimiento.slice(0, 16)}
                  <span className="mx-1.5">·</span>
                  Registrado por {movement.username}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
