import { ImageOff, Package } from "lucide-react";

import { useInView } from "@/shared/hooks/use-in-view";
import { cn } from "@/shared/lib/utils";

import { useAssetImage } from "@/modules/assets/hooks/useAssetImage";
import type { Asset } from "@/modules/assets";

interface Props {
  asset: Pick<Asset, "id" | "imagenArchivo">;
  className?: string;
}

/** Miniatura 4:3 para listas. Decorativa: el enlace que la contiene ya describe el activo. */
export default function AssetThumb({ asset, className }: Props) {
  const { ref, seen } = useInView<HTMLDivElement>();
  const { url, isError } = useAssetImage(asset.id, asset.imagenArchivo, seen);

  const loading = asset.imagenArchivo !== null && !url && !isError;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "flex aspect-4/3 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border sm:w-28",
        "border-slate-200 bg-slate-50 text-slate-300",
        "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600",
        loading && "animate-pulse",
        className,
      )}
    >
      {url ? (
        <img
          src={url}
          alt=""
          decoding="async"
          className="size-full object-cover"
        />
      ) : isError ? (
        <ImageOff size={20} />
      ) : loading ? null : (
        <Package size={22} />
      )}
    </div>
  );
}
