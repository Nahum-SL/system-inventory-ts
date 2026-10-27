import { useMutation } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import Button from "@/shared/components/ui/Buttons/button";
import { saveBlob } from "@/shared/lib/download";

interface Props {
  fetchFile: () => Promise<{ blob: Blob; filename: string }>;
  label?: string;
  disabled?: boolean;
}

export default function ExportButton({
  fetchFile,
  label = "Exportar CSV",
  disabled,
}: Props) {
  const mutation = useMutation({
    mutationFn: fetchFile,
    onSuccess: ({ blob, filename }) => {
      saveBlob(blob, filename);
      toast.success(`Descargado: ${filename}`);
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo exportar el archivo.");
    },
  });

  return (
    <Button
      variant="primary"
      loading={mutation.isPending}
      disabled={disabled}
      onClick={() => mutation.mutate()}
      className="w-full shrink-0 sm:w-auto"
    >
      {!mutation.isPending && <Download size={16} aria-hidden="true" />}
      {label}
    </Button>
  );
}
