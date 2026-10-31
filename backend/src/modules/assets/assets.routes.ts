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
  deleteAssetImage,
  getAssetByCode,
  getAssetById,
  getAssetImage,
  getAssetQr,
  listAssets,
  updateAsset,
  updateAssetStatus,
  uploadAssetImage,
} from "./assets.controller.js";
import { imageBody } from "../../shared/middlewares/imageBody.middleware.js";

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

// IMAGENES

// Lectura
assetsRoutes.get("/:id/imagen", getAssetImage);

// Escritura (admin primero, para no recibir 5 MB de quien no tiene permiso)
assetsRoutes.put(
  "/:id/imagen",
  authorize("admin"),
  imageBody,
  uploadAssetImage,
);
assetsRoutes.delete("/:id/imagen", authorize("admin"), deleteAssetImage);


export default assetsRoutes;
