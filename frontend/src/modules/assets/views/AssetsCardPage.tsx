import { Link, useParams } from "react-router";
import Spinner from "@/shared/components/Spinner";
import { ApiError } from "@/shared/lib/api-error";
import AssetQr from "../components/AssetQr";
import HistorySection from "../components/HistorySection";
import StatusBadge from "../components/StatusBadge";
import { useAssetCard } from "../hooks/useAssetCard";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

const sectionTitle =
  "mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500";

export default function AssetCardPage() {
  const { codigo = "" } = useParams();
  const { data: asset, isPending, error } = useAssetCard(codigo);

  if (isPending) return <Spinner />;

  if (error) {
    const status = error instanceof ApiError ? error.status : 0;
    const title =
      status === 410
        ? "Activo dado de baja"
        : status === 404
          ? "Activo no encontrado"
          : "No se pudo cargar";

    return (
      <div
        className={`space-y-3 rounded-lg border p-4 ${
          status === 410
            ? "border-amber-300 bg-amber-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <h1 className="font-semibold">{title}</h1>
        <p className="text-sm">{error.message}</p>
        <Link
          to="/activos"
          className="inline-block text-sm text-blue-700 underline"
        >
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-4">
      <Link to="/activos" className="text-sm text-blue-700 underline">
        ← Activos
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold">
            {asset.codigoInventario}
          </h1>
          <p className="mt-1 text-slate-700">{asset.descripcion}</p>
        </div>
        <StatusBadge estado={asset.estado} />
      </header>

      {asset.mantenimientoAbierto && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
          <p className="font-semibold">
            Mantenimiento en curso ({asset.mantenimientoAbierto.tipo})
          </p>
          <p>{asset.mantenimientoAbierto.descripcion}</p>
          <p className="text-slate-600">
            Desde {asset.mantenimientoAbierto.fecha}
          </p>
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className={sectionTitle}>Responsable actual</h2>
        {asset.asignacionActual ? (
          <dl className="divide-y divide-slate-100">
            <Row label="Persona" value={asset.asignacionActual.personaNombre} />
            <Row label="Cargo" value={asset.asignacionActual.cargoNombre} />
            <Row label="Desde" value={asset.asignacionActual.fechaInicio} />
          </dl>
        ) : (
          <p className="text-sm text-green-700">
            Disponible: sin responsable asignado.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className={sectionTitle}>Datos</h2>
        <dl className="divide-y divide-slate-100">
          <Row label="Marca" value={asset.marcaNombre} />
          <Row label="Categoría" value={asset.categoriaNombre} />
          <Row label="Área" value={asset.areaNombre} />
          <Row label="Fecha de ingreso" value={asset.fechaIngreso} />
        </dl>
      </section>

      <HistorySection assetId={asset.id} />
      <AssetQr id={asset.id} codigo={asset.codigoInventario} />
    </article>
  );
}
