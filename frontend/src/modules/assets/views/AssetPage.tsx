import type { ReactNode } from "react";
import { Package, Plus, SearchX } from "lucide-react";

// COMPONENTS - SHARED
import Alert from "@/shared/components/ui/Alert";
import { EmptyState } from "@/shared/components/ui/states/EmptyState";
import { LoadingState } from "@/shared/components/ui/states/LoadingState";

// COMPONENTS - ASSETS
import AssetFiltersBar from "../components/AssetFilters";
import AssetListItem from "../components/AssetListItem";

// HOOKS
import { useAssetFilters } from "../hooks/useAssetFilters";
import { useAssets } from "../hooks/useAsset";
import type { AssetFilters } from "../types";
import SectionHeader from "@/shared/components/ui/SectionHeader";
import { Link } from "react-router";
import { cn } from "@/shared/lib/utils";

interface Props {
  basePath: string;
  exportAction?: (filters: AssetFilters) => ReactNode;
}

export default function AssetsPage({ basePath, exportAction }: Props) {
  const { filters, text, onSearch, update, clear, hasActive } =
    useAssetFilters();

  const { data, isPending, error } = useAssets(filters);

  const assets = data ?? [];
  const hasAssets = assets.length > 0;
  const isEmpty = !isPending && !error && assets.length === 0;

  return (
    <section className="space-y-6">
      {/* Encabezado */}
      <SectionHeader
        title="Activos"
        description="Consulta y administra los activos registrados."
        icon={Package}
        actions={
          <Link
            to="/admin/activos/nuevo"
            className={cn(
              "inline-flex min-h-10 items-center justify-center gap-2",
              "rounded-xl border border-transparent px-4 py-2",
              "text-sm font-medium transition-colors duration-200",
              "bg-amber-600 text-white hover:bg-amber-700",
              "dark:bg-amber-500 dark:text-gray-950 dark:hover:bg-amber-400",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-amber-500 focus-visible:ring-offset-2",
              "dark:focus-visible:ring-offset-gray-900",
            )}
          >
            <Plus size={16} aria-hidden="true" />
            Nuevo activo
          </Link>
        }
      />
      {/* Filtros y búsqueda */}
      <AssetFiltersBar
        filters={filters}
        text={text}
        hasActive={hasActive}
        onSearch={onSearch}
        onChange={update}
        onClear={clear}
      />

      {/* Estado de carga */}
      {isPending && (
        <div
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
          role="status"
          aria-label="Cargando activos"
        >
          <LoadingState />
        </div>
      )}

      {/* Estado de error */}
      {!isPending && error && (
        <div role="alert">
          <Alert>{error.message}</Alert>
        </div>
      )}

      {/* Estado vacío */}
      {isEmpty && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 dark:border-gray-700 dark:bg-gray-900 sm:px-6">
          <EmptyState
            icon={SearchX}
            title={hasActive ? "Sin resultados" : "Aún no hay activos"}
            description={
              hasActive
                ? "No encontramos activos con esos criterios. Prueba con otros filtros o límpialos."
                : "Todavía no hay activos registrados. Registra el primero desde «Nuevo activo»."
            }
          />
        </div>
      )}

      {/* Resultados */}
      {!isPending && !error && hasAssets && (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
              aria-live="polite"
            >
              <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {assets.length}
              </span>
              <span>
                {assets.length === 1
                  ? "activo encontrado"
                  : "activos encontrados"}
              </span>
            </div>

            {exportAction?.(filters) && (
              <div className="flex items-center gap-2">
                {exportAction(filters)}
              </div>
            )}
          </div>

          <ul className="space-y-3">
            {assets.map((asset) => (
              <li key={asset.id}>
                <AssetListItem asset={asset} basePath={basePath} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
