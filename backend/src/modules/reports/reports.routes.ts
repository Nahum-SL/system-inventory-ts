import { Router } from "express";
// MIDDLEWARE
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// CONTROLLER
import {
  exportAssets,
  exportAssetSheet,
  exportMaintenance,
  exportMovements,
  getSummary,
} from "./reports.controller.js";
// SCHEMA - ASSETS
import { listAssetsQuerySchema } from "../assets/assets.schema.js";
// SCHEMA - REPORTS
import { exportRangeQuerySchema } from "./reports.schema.js";

const reportsRoutes = Router();

// ENDPOINTS
reportsRoutes.use(authenticate, authorize("admin"));
reportsRoutes.get("/summary", getSummary);

reportsRoutes.get(
  "/export/assets",
  validate(listAssetsQuerySchema, "query"),
  exportAssets,
);
reportsRoutes.get(
  "/export/movements",
  validate(exportRangeQuerySchema, "query"),
  exportMovements,
);
reportsRoutes.get(
  "/export/maintenance",
  validate(exportRangeQuerySchema, "query"),
  exportMaintenance,
);

reportsRoutes.get("/export/asset-sheet/:codigo", exportAssetSheet);

export default reportsRoutes;
