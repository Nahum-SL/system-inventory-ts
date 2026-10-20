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

const areasRoutes = Router();

// Todas las operaciones requieren autenticación.
areasRoutes.use(authenticate);

// Lectura: cualquier usuario autenticado.
areasRoutes.get("/", listAreas);
areasRoutes.get("/:id", getAreaById);

// Escritura: solo administradores.
areasRoutes.post(
  "/",
  authorize("admin"),
  validate(createAreaSchema),
  createArea,
);

areasRoutes.patch(
  "/:id",
  authorize("admin"),
  validate(updateAreaSchema),
  updateArea,
);

export default areasRoutes;
