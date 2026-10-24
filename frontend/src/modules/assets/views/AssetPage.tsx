import { useState, type ReactNode } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
// COMPONENT UI
import Spinner from "@/shared/components/Spinner";
// ASSET COMPONENTS
import AssetFilters from "../components/AssetFilters";
import AssetListItem from "../components/AssetListItem";
// HOOKS
import { useAssets } from "../hooks/useAsset";
// TYPES
import type { AssetStatus } from "../types";

interface Props {
  basePath: string;
  headerAction?: ReactNode;
}

export default function AssetsPage({ basePath, headerAction }: Props) {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<AssetStatus | "">("");
  const debouncedQ = useDebounce(q.trim());

  const { data, isPending, error } = useAssets({ q: debouncedQ, estado });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Activos</h1>
        {headerAction}
      </div>
      
      <AssetFilters
        q={q}
        estado={estado}
        onQChange={setQ}
        onEstadoChange={setEstado}
      />

      {isPending && <Spinner />}
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-red-700">{error.message}</p>
      )}

      {data && (
        <>
          <p className="text-sm text-slate-500">{data.length} resultado(s)</p>
          <ul className="space-y-2">
            {data.map((asset) => (
              <li key={asset.id}>
                <AssetListItem asset={asset} basePath={basePath} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
