import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImageOff, ImagePlus, Undo2 } from "lucide-react";

import Button from "@/shared/components/ui/Buttons/button";
import { useImagePreview } from "@/shared/hooks/use-image-preview";

/** keep: no tocar · replace: subir esta · remove: quitar la actual. */
export type ImageValue =
  | { kind: "keep" }
  | { kind: "replace"; file: File }
  | { kind: "remove" };

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  label?: string;
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  /** Cómo se ve la imagen que ya existe; omítelo si no hay. */
  current?: ReactNode;
  disabled?: boolean;
  maxBytes?: number;
}

export default function ImagePicker({
  label = "Imagen",
  value,
  onChange,
  current,
  disabled,
  maxBytes = 12 * 1024 * 1024,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { previewUrl, setFile } = useImagePreview();
  const [error, setError] = useState<string | null>(null);

  const hasCurrent = Boolean(current);
  const openDialog = () => inputRef.current?.click();

  const change = (next: ImageValue) => {
    setFile(next.kind === "replace" ? next.file : null);
    setError(null);
    onChange(next);
  };

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite elegir de nuevo el mismo archivo
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      setError("Formato no permitido. Usa JPG, PNG o WebP.");
      return;
    }
    if (file.size > maxBytes) {
      setError(
        `La imagen supera los ${Math.round(maxBytes / 1024 / 1024)} MB.`,
      );
      return;
    }
    change({ kind: "replace", file });
  }

  const pickLabel =
    value.kind === "replace"
      ? "Elegir otra"
      : value.kind === "keep" && hasCurrent
        ? "Cambiar imagen"
        : "Subir imagen";

  return (
    <div role="group" aria-label={label} className="space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={value.kind}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="sm:w-48 sm:shrink-0"
          >
            {value.kind === "replace" && previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa de la imagen nueva"
                className="aspect-4/3 w-full rounded-xl border border-slate-200 object-cover dark:border-gray-700"
              />
            ) : value.kind === "keep" && current ? (
              current
            ) : (
              <button
                type="button"
                onClick={openDialog}
                disabled={disabled}
                className="flex aspect-4/3 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-2 text-center text-sm text-slate-500 transition-colors hover:border-amber-400 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800/50 dark:text-slate-400 dark:hover:border-amber-500 dark:hover:text-amber-400"
              >
                <ImagePlus size={24} aria-hidden="true" />
                {value.kind === "remove"
                  ? "Se quitará al guardar"
                  : "Seleccionar imagen"}
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={disabled}
            onChange={onPick}
          />

          <Button variant="secondary" disabled={disabled} onClick={openDialog}>
            <ImagePlus size={16} aria-hidden="true" />
            {pickLabel}
          </Button>

          {value.kind === "keep" && hasCurrent && (
            <Button
              variant="danger-outline"
              disabled={disabled}
              onClick={() => change({ kind: "remove" })}
            >
              <ImageOff size={16} aria-hidden="true" />
              Quitar imagen
            </Button>
          )}

          {value.kind !== "keep" && (
            <>
              <Button
                variant="secondary"
                disabled={disabled}
                onClick={() => change({ kind: "keep" })}
              >
                <Undo2 size={16} aria-hidden="true" />
                {value.kind === "remove" ? "Deshacer" : "Descartar cambio"}
              </Button>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Cambio pendiente: se aplica al guardar.
              </p>
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
