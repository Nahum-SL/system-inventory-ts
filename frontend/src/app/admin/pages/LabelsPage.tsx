import { useState } from "react";
// COMPONENtES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import Spinner from "@/shared/components/Spinner";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// Hooks
import { useDebounce } from "@/shared/hooks/useDebounce";
// Modulo Asset
import {
  AssetFiltersBar,
  LabelSheet,
  useAssetQrs,
  useAssets,
  LABEL_SIZES,
  type Asset,
  type AssetStatus,
  type LabelSizeId,
} from "@/modules/assets";

export default function LabelsPage() {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<AssetStatus | "">("");
  const [size, setSize] = useState<LabelSizeId>("pequena");
  const [selected, setSelected] = useState<Map<number, Asset>>(new Map());

  const debouncedQ = useDebounce(q.trim());
  const { data, isPending, error } = useAssets({ q: debouncedQ, estado });

  const chosen = [...selected.values()];
  const qrs = useAssetQrs(chosen.map((a) => a.id));
  const ready = qrs.every((r) => r.isSuccess);
  const failed = qrs.some((r) => r.isError);
  const items = chosen.map((asset, i) => ({ asset, svg: qrs[i]?.data }));

  const toggle = (asset: Asset) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(asset.id)) next.delete(asset.id);
      else next.set(asset.id, asset);
      return next;
    });

  const selectVisible = () =>
    setSelected((prev) => {
      const next = new Map(prev);
      data?.forEach((a) => next.set(a.id, a));
      return next;
    });

  return (
    <section className="space-y-6">
      <div className="space-y-4 print:hidden">
        <h1 className="text-xl font-semibold">Etiquetas QR</h1>

        <AssetFiltersBar
          q={q}
          estado={estado}
          onQChange={setQ}
          onEstadoChange={setEstado}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={selectVisible}
            disabled={!data?.length}
          >
            Seleccionar los {data?.length ?? 0} visibles
          </Button>
          <Button
            variant="secondary"
            onClick={() => setSelected(new Map())}
            disabled={selected.size === 0}
          >
            Limpiar selección
          </Button>
          <span className="text-sm text-slate-500">
            {selected.size} seleccionado(s)
          </span>
        </div>

        {isPending && <Spinner />}
        {error && <Alert>{error.message}</Alert>}

        {data && (
          <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 bg-white">
            {data.map((asset) => (
              <li key={asset.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selected.has(asset.id)}
                    onChange={() => toggle(asset)}
                    className="h-4 w-4"
                  />
                  <span className="font-mono font-semibold">
                    {asset.codigoInventario}
                  </span>
                  <span className="truncate text-slate-600">
                    {asset.descripcion}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <label className="text-sm font-medium">
            Tamaño de etiqueta
            <select
              className={controlClass}
              value={size}
              onChange={(e) => setSize(e.target.value as LabelSizeId)}
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
            disabled={selected.size === 0 || !ready}
          >
            {selected.size > 0 && !ready && !failed
              ? "Preparando QR…"
              : "Imprimir etiquetas"}
          </Button>
        </div>

        {failed && (
          <Alert>
            No se pudo generar el QR de algún activo. Reintenta antes de
            imprimir.
          </Alert>
        )}

        <Alert tone="info">
          Cada QR codifica la dirección configurada en el servidor. Imprime una
          etiqueta de prueba y escanéala con el celular antes de imprimir el
          lote.
        </Alert>

        {selected.size > 0 && (
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Vista previa
          </h2>
        )}
      </div>

      <LabelSheet items={items} size={size} />
    </section>
  );
}
