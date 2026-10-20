import { Router } from "express";
// Middleware
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// Schema
import { createAreaSchema, updateAreaSchema } from "./areas.schema.js";
// Controller
import {
  listAreas,
  getAreaById,
  createArea,
  updateArea,
} from "./areas.controller.js";

const areaRoutes = Router();

// Todas las operaciones requieren autenticación.
areaRoutes.use(authenticate);

// Lectura: cualquier usuario autenticado.
areaRoutes.get("/", listAreas);
areaRoutes.get("/:id", getAreaById);

// Escritura: solo administradores.
areaRoutes.post(
  "/",
  authorize("admin"),
  validate(createAreaSchema),
  createArea,
);

areaRoutes.patch(
  "/:id",
  authorize("admin"),
  validate(updateAreaSchema),
  updateArea,
);

export default areaRoutes;
