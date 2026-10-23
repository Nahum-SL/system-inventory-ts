import { Link } from "react-router";
import type { Asset } from "../types";
import StatusBadge from "./StatusBadge";

export default function AssetListItem({ asset }: { asset: Asset }) {
  return (
    <Link
      to={`/activos/${encodeURIComponent(asset.codigoInventario)}`}
      className="block rounded-lg border border-slate-200 bg-white p-3 
      transition hover:border-brand-400 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-sm font-semibold text-brand-700">
          {asset.codigoInventario}
        </span>
        <StatusBadge estado={asset.estado} />
      </div>
      <p className="mt-1 text-sm">{asset.descripcion}</p>
      <p className="mt-1 text-xs text-slate-500">
        {asset.marcaNombre} · {asset.categoriaNombre} · {asset.areaNombre}
      </p>
    </Link>
  );
}
