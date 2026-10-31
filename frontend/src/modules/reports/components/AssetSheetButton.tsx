import type { ComponentProps } from "react";
import { downloadAssetSheet } from "../api/export.api";
import ExportButton from "./ExportButton";

type Props = { codigo: string } & Pick<
  ComponentProps<typeof ExportButton>,
  "variant" | "className" | "label"
>;

export default function AssetSheetButton({
  codigo,
  label = "Descargar hoja de vida (PDF)",
  ...style
}: Props) {
  return (
    <ExportButton
      fetchFile={() => downloadAssetSheet(codigo)}
      label={label}
      {...style}
    />
  );
}
