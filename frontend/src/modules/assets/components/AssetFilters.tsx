import type { AssetStatus } from "../types";
import { STATUS_LABELS } from "../utils/status";

interface Props {
  q: string;
  estado: AssetStatus | "";
  onQChange: (value: string) => void;
  onEstadoChange: (value: AssetStatus | "") => void;
}

export default function AssetFilters({
  q,
  estado,
  onQChange,
  onEstadoChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        type="search"
        value={q}
        onChange={(e) => onQChange(e.target.value)}
        placeholder="Buscar por código, descripción, marca, área…"
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 
        outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <select
        value={estado}
        onChange={(e) => onEstadoChange(e.target.value as AssetStatus | "")}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 
        outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <option value="">Todos los estados</option>
        {(Object.keys(STATUS_LABELS) as AssetStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
