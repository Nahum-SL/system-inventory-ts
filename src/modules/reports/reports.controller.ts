import { asyncHandler } from "../../shared/utils/asyncHandler.js";
// SERVICE
import { reportsService } from "./reports.service.js";

/** Resumen del inventario (solo admin). */
export const getSummary = asyncHandler(async (_req, res) => {
  const summary = await reportsService.getSummary();

  res.status(200).json({ status: "success", data: summary });
});
