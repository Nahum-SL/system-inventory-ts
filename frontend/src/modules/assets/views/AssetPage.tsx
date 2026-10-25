import type { ReactNode } from "react";
import { SearchX } from "lucide-react";
// COMPONENTS - ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Spinner from "@/shared/components/Spinner";
import { EmptyState } from "@/shared/components/ui/states/EmptyState";
// COMPONENTS - ASSETS
import AssetFiltersBar from "../components/AssetFilters";
import AssetListItem from "../components/AssetListItem";
// HOOKS
import { useAssetFilters } from "../hooks/useAssetFilters";
import { useAssets } from "../hooks/useAsset";
import type { AssetFilters } from "../types";

interface Props {
  basePath: string;
  headerAction?: ReactNode;
  exportAction?: (filters: AssetFilters) => ReactNode;
}

export default function AssetsPage({
  basePath,
  headerAction,
  exportAction,
}: Props) {
  const { filters, text, onSearch, update, clear, hasActive } =
    useAssetFilters();
  const { data, isPending, error } = useAssets(filters);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Activos</h1>
        {headerAction}
      </div>

      <AssetFiltersBar
        filters={filters}
        text={text}
        hasActive={hasActive}
        onSearch={onSearch}
        onChange={update}
        onClear={clear}
      />

      {isPending && <Spinner />}
      {error && <Alert>{error.message}</Alert>}

      {data && data.length === 0 && (
        <EmptyState
          icon={SearchX}
          title={hasActive ? "Sin resultados" : "Aún no hay activos"}
          description={
            hasActive
              ? "Prueba con otros filtros o límpialos."
              : "Registra el primero desde «Nuevo activo»."
          }
        />
      )}

      {data && data.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">{data.length} resultado(s)</p>
            {exportAction?.(filters)}
          </div>
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
