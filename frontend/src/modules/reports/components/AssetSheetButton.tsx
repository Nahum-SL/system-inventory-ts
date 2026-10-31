import { downloadAssetSheet } from "../api/export.api";
import ExportButton from "./ExportButton";

export default function AssetSheetButton({ codigo }: { codigo: string }) {
  return (
    <ExportButton
      fetchFile={() => downloadAssetSheet(codigo)}
      label="Descargar hoja de vida (PDF)"
    />
  );
}
