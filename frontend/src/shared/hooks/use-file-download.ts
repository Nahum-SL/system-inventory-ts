import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
// UTILS
import { saveBlob } from "@/shared/lib/download";

export type FetchFile = () => Promise<{ blob: Blob; filename: string }>;

/** Pide un archivo al servidor, lo descarga y avisa del resultado. */
export function useFileDownload(fetchFile: FetchFile) {
  return useMutation({
    mutationFn: fetchFile,
    onSuccess: ({ blob, filename }) => {
      saveBlob(blob, filename);
      toast.success(`Descargado: ${filename}`);
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo exportar el archivo.");
    },
  });
}
