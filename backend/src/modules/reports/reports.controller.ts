import type { Response } from "express";
// MANEJO DE ERRORES
import { BadRequestError } from "../../shared/errors/AppError.js";
// UTILS
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
// PDF - ASSET SHEET SERVICE
import { assetSheetService } from "./asset-sheet.service.js";

// TYPES
import type { CsvFile, DistributionFilters, ExportRange } from "./reports.types.js";
import type { AssetFilters } from "../assets/assets.types.js";
// SERVICE
import { reportsService } from "./reports.service.js";
import { assetListService } from "./asset-list.service.js";

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

/** Distribución de activos por área y categoría, con filtros (solo admin). */
export const getDistribution = asyncHandler(async (req, res) => {
  const filters = req.query as DistributionFilters; // ya validado por distributionQuerySchema
  const data = await reportsService.getDistribution(filters);

  res.status(200).json({ status: "success", data });
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



export const exportAssetSheet = asyncHandler(async (req, res) => {
  const codigo = String(req.params.codigo ?? "").trim();
  if (!codigo || codigo.length > 50) throw new BadRequestError("Código de activo inválido");

  const { pdf, fileName } = await assetSheetService.build(codigo, req.auth!.username);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Cache-Control", "no-store");
  res.send(Buffer.from(pdf));
});

/**
 * CONTROLADOR PARA LA EXPORTACION DE LOS PDFS DE ACTIVOS (IGNORANDO EL HISTORIAL -> TRANSACCIONES - MANTENIMIENTO..)
 */
export const exportAssetsPdf = asyncHandler(async (req, res) => {
  const { incluirBajas = false, ...filters } = req.query as AssetFilters & {
    incluirBajas?: boolean;
  };

  const { pdf, fileName } = await assetListService.build(
    filters,
    incluirBajas,
    req.auth!.username,
  );

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Cache-Control", "no-store");
  res.send(Buffer.from(pdf));
});