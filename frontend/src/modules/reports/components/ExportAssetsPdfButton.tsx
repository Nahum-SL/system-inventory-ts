import { downloadAssetsPdf } from "../api/export.api";
import type { AssetExportFilters } from "../types";
import ExportButton from "./ExportButton";

export default function ExportAssetsPdfButton({
  filters,
}: {
  filters: AssetExportFilters;
}) {
  return (
    <ExportButton
      fetchFile={() => downloadAssetsPdf(filters)}
      label="Exportar lista (PDF)"
      variant="primary"
    />
  );
}
