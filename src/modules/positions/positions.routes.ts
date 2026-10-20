import { Router } from "express";
// MIDDLEWARES
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// SCHEMA
import {
  createPositionSchema,
  updatePositionSchema,
} from "./positions.schema.js";
// CONTROLADOR
import {
  listPositions,
  getPositionById,
  createPosition,
  updatePosition,
} from "./positions.controller.js";

const positionsRoutes = Router();

positionsRoutes.use(authenticate);

// Lectura: cualquier usuario autenticado.
positionsRoutes.get("/", listPositions);
positionsRoutes.get("/:id", getPositionById);

// Escritura: solo administradores.
positionsRoutes.post(
  "/",
  authorize("admin"),
  validate(createPositionSchema),
  createPosition,
);

positionsRoutes.patch(
  "/:id",
  authorize("admin"),
  validate(updatePositionSchema),
  updatePosition,
);

export default positionsRoutes;
