import { useState } from "react";
import Spinner from "@/shared/components/Spinner";
import { useDebounce } from "@/shared/hooks/useDebounce";
import AssetFilters from "../components/AssetFilters";
import AssetListItem from "../components/AssetListItem";
import { useAssets } from "../hooks/useAsset";
import type { AssetStatus } from "../types";

export default function AssetsPage() {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<AssetStatus | "">("");
  const debouncedQ = useDebounce(q.trim());

  const { data, isPending, error } = useAssets({ q: debouncedQ, estado });

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Activos</h1>

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
                <AssetListItem asset={asset} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
