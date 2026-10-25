import { Router } from "express";
// Middlewares
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// Schema
import { createMovementSchema } from "./movements.schema.js";
// Controlador
import { createMovement, getMovementHistory } from "./movements.controller.js";

const movementsRoutes = Router();

// Router montado en la raíz de /api: cada ruta declara su propia autenticación.
// Un use(authenticate) aquí interceptaría también las rutas inexistentes (401 en vez de 404).

movementsRoutes.get("/assets/:id/movements", authenticate, getMovementHistory);

movementsRoutes.post(
  "/assets/:id/movements",
  authenticate,
  authorize("admin"),
  validate(createMovementSchema),
  createMovement,
);

export default movementsRoutes;
