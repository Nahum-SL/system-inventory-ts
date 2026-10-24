import { Router } from "express";
// MIDDLEWARES
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import {
  createAssetSchema,
  updateAssetSchema,
  updateAssetStatusSchema,
  decommissionAssetSchema,
  listAssetsQuerySchema,
  assetCodeParamSchema,
} from "./assets.schema.js";
import {
  createAsset,
  getAssetById,
  listAssets,
  updateAsset,
  updateAssetStatus,
  decommissionAsset,
  getAssetByCode,
  getAssetQr,
} from "./assets.controller.js";

const assetsRoutes = Router();

assetsRoutes.use(authenticate);

assetsRoutes.get("/", validate(listAssetsQuerySchema, "query"), listAssets);
// Ficha por código (paso 3): va ANTES de "/:id".
// assetsRoutes.get("/code/:codigo", getAssetByCode);
assetsRoutes.get("/:id", getAssetById);

assetsRoutes.post(
  "/",
  authorize("admin"),
  validate(createAssetSchema),
  createAsset,
);
assetsRoutes.patch(
  "/:id",
  authorize("admin"),
  validate(updateAssetSchema),
  updateAsset,
);
assetsRoutes.patch(
  "/:id/status",
  authorize("admin"),
  validate(updateAssetStatusSchema),
  updateAssetStatus,
);
assetsRoutes.post(
  "/:id/decommission",
  authorize("admin"),
  validate(decommissionAssetSchema),
  decommissionAsset,
);

// Endpoints para el QR
assetsRoutes.get(
  "/code/:codigo",
  validate(assetCodeParamSchema, "params"),
  getAssetByCode,
);
assetsRoutes.get("/:id/qr", getAssetQr);

export default assetsRoutes;
