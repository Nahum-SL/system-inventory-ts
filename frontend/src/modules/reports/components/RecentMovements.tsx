import { Link } from "react-router";
import type { RecentMovement } from "../types";

interface Props {
  movements: RecentMovement[];
  assetHref: (codigo: string) => string;
}

export default function RecentMovements({ movements, assetHref }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Últimos traslados
      </h2>

      {movements.length === 0 ? (
        <p className="text-sm text-slate-500">Aún no hay traslados.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {movements.map((m) => (
            <li key={m.id} className="py-2 text-sm">
              <Link
                to={assetHref(m.codigoInventario)}
                className="font-mono font-semibold text-blue-700 underline"
              >
                {m.codigoInventario}
              </Link>
              <span className="text-slate-700">
                {" "}
                {m.areaOrigenNombre ?? "—"} → {m.areaDestinoNombre}
              </span>
              <p className="text-xs text-slate-500">
                {m.fechaMovimiento.slice(0, 16)} · por {m.username}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
