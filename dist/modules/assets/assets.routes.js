import { Router } from "express";
// MIDDLEWARES
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// SCHEMA - Valida que se cumpla el Contrato
import { createAssetSchema } from "./assets.schema.js";
// CONTROLLER
import { createAsset, getAssetById, listAssets } from "./assets.controller.js";
const assetsRoutes = Router();
assetsRoutes.use(authenticate);
// RUTAS
assetsRoutes.get("/", listAssets);
assetsRoutes.get("/:id", getAssetById);
assetsRoutes.post("/", authorize("admin"), validate(createAssetSchema), createAsset);
export default assetsRoutes;
//# sourceMappingURL=assets.routes.js.map