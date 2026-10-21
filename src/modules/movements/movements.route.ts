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

movementsRoutes.use(authenticate);

movementsRoutes.get("/assets/:id/movements", getMovementHistory);

movementsRoutes.post(
  "/assets/:id/movements",
  authorize("admin"),
  validate(createMovementSchema),
  createMovement,
);

export default movementsRoutes;
