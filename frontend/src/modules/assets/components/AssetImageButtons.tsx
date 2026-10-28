import { useRef, type ChangeEvent } from "react";
import { ImageOff, ImagePlus } from "lucide-react";
import { toast } from "sonner";
// ATOMIC COMPONENTS
import Button from "@/shared/components/ui/Buttons/button";
// HOOKS
import {
  useDeleteAssetImage,
  useUploadAssetImage,
} from "../hooks/use-asset-mutation";
// TYPES
import type { AssetCard } from "../types";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 12 * 1024 * 1024;

interface Props {
  asset: AssetCard;
  buttonClassName?: string;
}

export default function AssetImageButtons({ asset, buttonClassName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAssetImage(asset.id);
  const remove = useDeleteAssetImage(asset.id);

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite elegir de nuevo el mismo archivo
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error("Usa una imagen JPG, PNG o WebP");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("La imagen supera los 12 MB");
      return;
    }

    upload.mutate(file, {
      onSuccess: () => toast.success("Imagen actualizada"),
      onError: (error) => toast.error(error.message),
    });
  }

  function onRemove() {
    if (!window.confirm("¿Quitar la imagen de este activo?")) return;

    remove.mutate(undefined, {
      onSuccess: () => toast.success("Imagen eliminada"),
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onPick}
      />

      <Button
        variant="secondary"
        className={buttonClassName}
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus size={16} aria-hidden="true" />
        {upload.isPending
          ? "Subiendo..."
          : asset.imagenArchivo
            ? "Cambiar imagen"
            : "Subir imagen"}
      </Button>

      {asset.imagenArchivo && (
        <Button
          variant="secondary"
          className={buttonClassName}
          disabled={remove.isPending}
          onClick={onRemove}
        >
          <ImageOff size={16} aria-hidden="true" />
          Quitar imagen
        </Button>
      )}
    </>
  );
}
