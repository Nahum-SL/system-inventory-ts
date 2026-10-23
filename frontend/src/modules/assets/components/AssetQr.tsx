import { useAssetQr } from "../hooks/useAssetQr";

export default function AssetQr({
  id,
  codigo,
}: {
  id: number;
  codigo: string;
}) {
  const { data: svg } = useAssetQr(id);

  if (!svg) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 text-center">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Código QR
      </h2>
      <img
        alt={`QR de ${codigo}`}
        className="mx-auto h-48 w-48"
        src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
      />
    </section>
  );
}
