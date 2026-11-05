import type { ComponentProps } from "react";
import { Download } from "lucide-react";
// ATOMIC COMPONENTS
import Button from "@/shared/components/ui/Buttons/button";
// HOOKS
import {
  useFileDownload,
  type FetchFile,
} from "@/shared/hooks/use-file-download";

interface Props {
  fetchFile: FetchFile;
  label?: string;
  disabled?: boolean;
  variant?: ComponentProps<typeof Button>["variant"];
  className?: string;
}

export default function ExportButton({
  fetchFile,
  label = "Exportar CSV",
  disabled,
  variant = "primary",
  className,
}: Props) {
  const download = useFileDownload(fetchFile);

  return (
    <Button
      variant={variant}
      loading={download.isPending}
      disabled={disabled}
      onClick={() => download.mutate()}
      className={className ?? "w-full shrink-0 sm:w-auto"}
    >
      {!download.isPending && <Download size={16} aria-hidden="true" />}
      {label}
    </Button>
  );
}
