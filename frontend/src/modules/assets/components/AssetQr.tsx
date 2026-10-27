import { QrCode } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { useAssetQrs } from "../hooks/useAssetQrs";

export default function AssetQr({
  id,
  codigo,
}: {
  id: number;
  codigo: string;
}) {
  const [result] = useAssetQrs([id]);
  const svg = result?.data;

  if (!svg) return null;

  return (
    <section
      aria-labelledby="asset-qr-title"
      className={cn(
        "flex flex-col items-center rounded-2xl border p-5 text-center sm:p-6",
        "border-slate-200 bg-white shadow-sm",
        "dark:border-gray-700 dark:bg-gray-900",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <QrCode
          size={18}
          className="text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <h2
          id="asset-qr-title"
          className="text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          Código QR del activo
        </h2>
      </div>

      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Escanea este código para identificar el activo.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-gray-700">
        <img
          alt={`Código QR del activo ${codigo}`}
          className="size-48 max-w-full object-contain"
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
        />
      </div>

      <p className="mt-3 break-all font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
        {codigo}
      </p>
    </section>
  );
}
