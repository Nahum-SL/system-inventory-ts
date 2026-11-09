import { Building2, ChevronRight, MapPin, Tag } from "lucide-react";
import { Link, useLocation } from "react-router";

import { cn } from "@/shared/lib/utils";

import type { Asset } from "../types";
import StatusBadge from "./StatusBadge";
import AssetThumb from "./AssetThumb";

interface Props {
  asset: Asset;
  basePath: string;
}

export default function AssetListItem({ asset, basePath }: Props) {
  const { search } = useLocation();

  return (
    <Link
      to={`${basePath}/${encodeURIComponent(asset.codigoInventario)}`}
      state={{ listSearch: search }}
      aria-label={`Ver activo ${asset.codigoInventario}: ${asset.descripcion}`}
      className={cn(
        "group relative block min-w-0 overflow-hidden rounded-2xl border p-4",
        "border-slate-200 bg-white shadow-sm",
        "transition-[border-color,background-color,box-shadow] duration-200",
        "hover:border-amber-300 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-amber-500 focus-visible:ring-offset-2",
        "dark:border-gray-700 dark:bg-gray-900",
        "dark:hover:border-amber-800 dark:hover:bg-gray-900/80",
        "dark:focus-visible:ring-offset-gray-950",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <AssetThumb asset={asset} />

        <div className="min-w-0 flex-1">
          <span className={cn(/* …igual que ahora… */)}>
            <span className="truncate">{asset.codigoInventario}</span>
          </span>

          <h3 className="mt-2 wrap-break-word text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100 sm:text-base">
            {asset.descripcion}
          </h3>

          {/* Móvil: el estado va bajo la descripción */}
          <div className="mt-2 sm:hidden">
            <StatusBadge estado={asset.estado} />
          </div>
        </div>

        {/* Escritorio: estado y flecha a la derecha */}
        <div className="hidden shrink-0 items-start gap-2 sm:flex">
          <StatusBadge estado={asset.estado} />
          <ChevronRight
            size={18}
            className={cn(
              "mt-0.5 text-slate-400 transition-transform",
              "group-hover:translate-x-0.5 group-hover:text-amber-600",
              "dark:text-slate-500 dark:group-hover:text-amber-400",
            )}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-gray-800 dark:text-slate-400 sm:text-sm">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Tag
            size={14}
            className="shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <span className="wrap-break-word">{asset.marcaNombre}</span>
        </span>

        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Building2
            size={14}
            className="shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <span className="wrap-break-word">{asset.categoriaNombre}</span>
        </span>

        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin
            size={14}
            className="shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <span className="wrap-break-word">{asset.areaNombre}</span>
        </span>
      </div>
    </Link>
  );
}
