import type { AssetCard } from "@/modules/assets";

export default function AssetActions({ asset }: { asset: AssetCard }) {
  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-blue-800">
        Acciones de administrador
      </h2>
      <p className="text-sm text-blue-900">
        Aquí irán cambiar estado, mantenimiento, asignación, traslado y baja de{" "}
        {asset.codigoInventario}.
      </p>
    </section>
  );
}
