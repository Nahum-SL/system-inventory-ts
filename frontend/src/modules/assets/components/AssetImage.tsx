import { ImageOff, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAssetImage } from "../hooks/useAssetImage";
import type { AssetCard } from "../types";

interface Props {
  asset: Pick<AssetCard, "id" | "codigoInventario" | "imagenArchivo">;
  className?: string;
}

export default function AssetImage({ asset, className }: Props) {
  const { url, isLoading, isError } = useAssetImage(
    asset.id,
    asset.imagenArchivo,
  );

  const frame = cn(
    "flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-xl border",
    "border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-800",
    className,
  );

  if (url) {
    return (
      <div className={frame}>
        <img
          src={url}
          alt={`Imagen del activo ${asset.codigoInventario}`}
          className="size-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(frame, "flex-col gap-2 text-slate-400 dark:text-slate-500")}
      role={isError ? "alert" : undefined}
    >
      {isLoading ? (
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
      ) : (
        <ImageOff size={28} aria-hidden="true" />
      )}
      <span className="text-xs">
        {isLoading
          ? "Cargando imagen..."
          : isError
            ? "No se pudo cargar la imagen"
            : "Sin imagen"}
      </span>
    </div>
  );
}
