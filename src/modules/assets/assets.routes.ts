import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import {
  assetCodeParamSchema,
  createAssetSchema,
  decommissionAssetSchema,
  listAssetsQuerySchema,
  updateAssetSchema,
  updateAssetStatusSchema,
} from "./assets.schema.js";
import {
  createAsset,
  decommissionAsset,
  getAssetByCode,
  getAssetById,
  getAssetQr,
  listAssets,
  updateAsset,
  updateAssetStatus,
} from "./assets.controller.js";

const assetsRoutes = Router();

// Este router está montado en /api/assets: todo lo que cuelga de ahí exige sesión.
assetsRoutes.use(authenticate);

// Lectura (cualquier usuario autenticado)
assetsRoutes.get("/", validate(listAssetsQuerySchema, "query"), listAssets);
assetsRoutes.get(
  "/code/:codigo",
  validate(assetCodeParamSchema, "params"),
  getAssetByCode,
);
assetsRoutes.get("/:id", getAssetById);
assetsRoutes.get("/:id/qr", getAssetQr);

// Escritura (solo admin)
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

export default assetsRoutes;
