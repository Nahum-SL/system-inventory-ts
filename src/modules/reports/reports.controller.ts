import type { Response } from "express";
import type { AssetFilters } from "../assets/assets.types.js";
import type { CsvFile, ExportRange } from "./reports.types.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
// SERVICE
import { reportsService } from "./reports.service.js";

function sendCsv(res: Response, file: CsvFile): void {
  res
    .status(200)
    .set({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      // Contiene datos personales: que ningún proxy ni navegador lo guarde.
      "Cache-Control": "no-store",
    })
    .send(file.content);
}

/** Resumen del inventario (solo admin). */
export const getSummary = asyncHandler(async (_req, res) => {
  const summary = await reportsService.getSummary();

  res.status(200).json({ status: "success", data: summary });
});

/** Activos con los filtros de la lista. El query llega validado. */
export const exportAssets = asyncHandler(async (req, res) => {
  sendCsv(res, await reportsService.exportAssets(req.query as AssetFilters));
});

export const exportMovements = asyncHandler(async (req, res) => {
  sendCsv(res, await reportsService.exportMovements(req.query as ExportRange));
});

export const exportMaintenance = asyncHandler(async (req, res) => {
  sendCsv(
    res,
    await reportsService.exportMaintenance(req.query as ExportRange),
  );
});
