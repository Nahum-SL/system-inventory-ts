import { Router } from "express";
// MIDDLEWARES
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// SCHEMA - Valida que se cumpla el Contrato
import { createAssetSchema, updateAssetSchema, updateAssetStatusSchema, } from "./assets.schema.js";
// CONTROLLER
import { createAsset, getAssetById, listAssets, deleteAsset, updateAsset, updateAssetStatus, } from "./assets.controller.js";
const assetsRoutes = Router();
assetsRoutes.use(authenticate);
// RUTAS
assetsRoutes.get("/", listAssets);
assetsRoutes.get("/:id", getAssetById);
assetsRoutes.post("/", authorize("admin"), validate(createAssetSchema), createAsset);
assetsRoutes.patch("/:id", authorize("admin"), validate(updateAssetSchema), updateAsset);
assetsRoutes.patch("/:id/status", authorize("admin"), validate(updateAssetStatusSchema), updateAssetStatus);
assetsRoutes.delete("/:id", authorize("admin"), deleteAsset);
export default assetsRoutes;
//# sourceMappingURL=assets.routes.js.map