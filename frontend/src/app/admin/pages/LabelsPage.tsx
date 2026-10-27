import { useState } from "react";
import { CheckCheck, Printer, RotateCcw, Tag } from "lucide-react";

// COMPONENTS ATOMICS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// ESTADO DE CARGA
import { LoadingState } from "@/shared/components/ui/states/LoadingState";
// ASSETS
import {
  AssetFiltersBar,
  LabelSheet,
  useAssetQrs,
  useAssets,
  LABEL_SIZES,
  type Asset,
  type LabelSizeId,
  useAssetFilters,
} from "@/modules/assets";
import { cn } from "@/shared/lib/utils";

export default function LabelsPage() {
  const [size, setSize] = useState<LabelSizeId>("pequena");
  const [selected, setSelected] = useState<Map<number, Asset>>(new Map());

  const { filters, text, onSearch, update, clear, hasActive } =
    useAssetFilters();

  const { data, isPending, error } = useAssets(filters);

  const chosen = [...selected.values()];
  const qrs = useAssetQrs(chosen.map((asset) => asset.id));

  const ready = chosen.length > 0 && qrs.every((result) => result.isSuccess);

  const failed = qrs.some((result) => result.isError);
  const isQrLoading = chosen.length > 0 && !ready && !failed;

  const items = chosen.map((asset, index) => ({
    asset,
    svg: qrs[index]?.data,
  }));

  const toggle = (asset: Asset) => {
    setSelected((prev) => {
      const next = new Map(prev);

      if (next.has(asset.id)) {
        next.delete(asset.id);
      } else {
        next.set(asset.id, asset);
      }

      return next;
    });
  };

  const selectVisible = () => {
    setSelected((prev) => {
      const next = new Map(prev);
      data?.forEach((asset) => next.set(asset.id, asset));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Map());

  return (
    <section className="min-w-0 space-y-6">
      <div className="space-y-5 print:hidden">
        {/* Encabezado */}
        <header className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <Tag size={21} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Etiquetas QR
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Selecciona activos y genera etiquetas para identificar el
              inventario.
            </p>
          </div>
        </header>

        {/* Filtros */}
        <AssetFiltersBar
          filters={filters}
          text={text}
          hasActive={hasActive}
          onSearch={onSearch}
          onChange={update}
          onClear={clear}
        />

        {/* Selección */}
        <div
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm 
        dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={selectVisible}
              disabled={!data?.length || isPending}
            >
              <CheckCheck
                size={16}
                aria-hidden="true"
                className={cn(
                  // Cambia a verde solo si hay data y todos los elementos visibles están en el Map de seleccionados
                  data?.length && data.every((asset) => selected.has(asset.id))
                    ? "text-green-500"
                    : "text-gray-500",
                )}
              />
              Seleccionar visibles ({data?.length ?? 0})
            </Button>
            <Button
              variant="secondary"
              onClick={clearSelection}
              disabled={selected.size === 0}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Limpiar
            </Button>{" "}
          </div>

          <p
            aria-live="polite"
            className="text-sm text-slate-600 dark:text-slate-300"
          >
            Seleccionados:{" "}
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              {selected.size}
            </span>
          </p>
        </div>

        {/* Resultados */}
        {isPending && <LoadingState />}

        {error && (
          <Alert>No se pudieron cargar los activos: {error.message}</Alert>
        )}

        {!isPending && !error && data?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center dark:border-gray-700 dark:bg-gray-900">
            <Tag
              size={28}
              className="mx-auto mb-3 text-slate-400"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              No hay activos para mostrar
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Prueba cambiando los filtros de búsqueda.
            </p>
          </div>
        )}

        {!!data?.length && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Activos disponibles
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Selecciona uno o varios activos para incluirlos en la impresión.
              </p>
            </div>

            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-gray-800">
              {data.map((asset) => {
                const checked = selected.has(asset.id);

                return (
                  <li key={asset.id}>
                    <label
                      className={[
                        "flex min-w-0 cursor-pointer items-start gap-3 px-4 py-3 transition-colors",
                        "hover:bg-slate-50 dark:hover:bg-gray-800/70",
                        checked ? "bg-amber-50/70 dark:bg-amber-950/20" : "",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(asset)}
                        className="mt-1 size-4 shrink-0 cursor-pointer accent-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block break-all font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 sm:text-sm">
                          {asset.codigoInventario}
                        </span>
                        <span className="mt-1 block wrap-break-word text-sm text-slate-600 dark:text-slate-400">
                          {asset.descripcion}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Configuración de impresión */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Configuración de impresión
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Define el tamaño de las etiquetas antes de imprimirlas.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="block w-full text-sm font-medium text-slate-700 dark:text-slate-300 sm:max-w-xs">
              Tamaño de etiqueta
              <select
                className={controlClass}
                value={size}
                onChange={(event) => setSize(event.target.value as LabelSizeId)}
              >
                {(Object.keys(LABEL_SIZES) as LabelSizeId[]).map((id) => (
                  <option key={id} value={id}>
                    {LABEL_SIZES[id].name}
                  </option>
                ))}
              </select>
            </label>

            <Button
              onClick={() => window.print()}
              disabled={!ready || failed}
              className="w-full sm:w-auto"
            >
              <Printer size={17} aria-hidden="true" />
              {failed
                ? "QR no disponible"
                : isQrLoading
                  ? "Preparando QR…"
                  : "Imprimir etiquetas"}
            </Button>
          </div>
        </div>

        {failed && (
          <Alert>
            No se pudo generar el QR de uno o varios activos. Reintenta la carga
            antes de imprimir.
          </Alert>
        )}

        <Alert tone="info">
          Cada QR codifica la dirección configurada en el servidor. Imprime una
          etiqueta de prueba y escanéala con el celular antes de imprimir el
          lote completo.
        </Alert>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Vista previa
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {selected.size} etiqueta(s) · {LABEL_SIZES[size].name}
            </span>
          </div>
        )}
      </div>

      {selected.size > 0 && <LabelSheet items={items} size={size} />}
    </section>
  );
}
