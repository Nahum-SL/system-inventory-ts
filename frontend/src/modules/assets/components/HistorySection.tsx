import { useState, type ReactNode } from "react";
import Spinner from "@/shared/components/Spinner";
import {
  useAssignmentHistory,
  useMaintenanceHistory,
  useMovementHistory,
} from "../hooks/useAssetHistory";

type Tab = "assignments" | "maintenance" | "movements";

const TABS: { id: Tab; label: string }[] = [
  { id: "assignments", label: "Asignaciones" },
  { id: "maintenance", label: "Mantenimientos" },
  { id: "movements", label: "Traslados" },
];

function State({
  isPending,
  error,
  empty,
  children,
}: {
  isPending: boolean;
  error: Error | null;
  empty: boolean;
  children: ReactNode;
}) {
  if (isPending) return <Spinner />;
  if (error) return <p className="text-sm text-red-700">{error.message}</p>;
  if (empty) return <p className="text-sm text-slate-500">Sin registros.</p>;
  return <ul className="divide-y divide-slate-100">{children}</ul>;
}

function Assignments({ id }: { id: number }) {
  const { data, isPending, error } = useAssignmentHistory(id);

  return (
    <State isPending={isPending} error={error} empty={data?.length === 0}>
      {data?.map((a) => (
        <li key={a.id} className="py-2 text-sm">
          <p className="font-medium">
            {a.personaNombre} · {a.cargoNombre}
          </p>
          <p className="text-slate-600">
            {a.fechaInicio} → {a.fechaFin ?? "en curso"}
          </p>
          <p className="text-slate-500">Entrega: {a.condicionEntrega}</p>
          {a.condicionDevolucion && (
            <p className="text-slate-500">
              Devolución: {a.condicionDevolucion}
            </p>
          )}
        </li>
      ))}
    </State>
  );
}

function Maintenance({ id }: { id: number }) {
  const { data, isPending, error } = useMaintenanceHistory(id);

  return (
    <State isPending={isPending} error={error} empty={data?.length === 0}>
      {data?.map((m) => (
        <li key={m.id} className="py-2 text-sm">
          <p className="font-medium">
            {m.descripcion}{" "}
            <span className="font-normal text-slate-500">({m.tipo})</span>
          </p>
          <p className="text-slate-600">
            {m.fecha} → {m.fechaFin ?? "en curso"}
          </p>
          {m.observaciones && (
            <p className="text-slate-500">{m.observaciones}</p>
          )}
          <p className="text-slate-500">Costo: S/ {m.costo.toFixed(2)}</p>
        </li>
      ))}
    </State>
  );
}

function Movements({ id }: { id: number }) {
  const { data, isPending, error } = useMovementHistory(id);

  return (
    <State isPending={isPending} error={error} empty={data?.length === 0}>
      {data?.map((m) => (
        <li key={m.id} className="py-2 text-sm">
          <p className="font-medium">
            {m.areaOrigenNombre ?? "—"} → {m.areaDestinoNombre}
          </p>
          <p className="text-slate-600">
            {m.fechaMovimiento} · por {m.username}
          </p>
          {m.motivo && <p className="text-slate-500">{m.motivo}</p>}
        </li>
      ))}
    </State>
  );
}

export default function HistorySection({ assetId }: { assetId: number }) {
  const [tab, setTab] = useState<Tab>("assignments");

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700">
        Historial
      </h2>

      <div className="mb-3 flex gap-1 border-b border-slate-200" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              tab === t.id
                ? "border-brand-600 font-medium text-brand-700"
                : "border-transparent text-slate-500 hover:text-brand-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "assignments" && <Assignments id={assetId} />}
      {tab === "maintenance" && <Maintenance id={assetId} />}
      {tab === "movements" && <Movements id={assetId} />}
    </section>
  );
}
