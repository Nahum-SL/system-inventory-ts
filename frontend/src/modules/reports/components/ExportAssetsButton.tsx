import { downloadAssets } from "../api/export.api";
import type { AssetExportFilters } from "../types";
import ExportButton from "./ExportButton";

export default function ExportAssetsButton({
  filters,
}: {
  filters: AssetExportFilters;
}) {
  return (
    <ExportButton
      fetchFile={() => downloadAssets(filters)}
      label="Exportar lista (CSV)"
      variant="secondary"
    />
  );
}
