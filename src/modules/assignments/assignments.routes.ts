import { Router } from "express";
// CONTROLLER - ASIGNMENTS / ASIGNACIONES
import {
  createAssignment,
  getAssignmentHistory,
  returnAssignment,
} from "./assignments.controller.js";
// SCHEMA - ASSIGNMENTS / ASIGNACIONES
import {
  createAssignmentSchema,
  returnAssignmentSchema,
} from "./assignments.schema.js";
// MIDDLEWARES
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";

const assignmentRoutes = Router();

// Router montado en la raíz de /api: cada ruta declara su propia autenticación.

assignmentRoutes.get(
  "/assets/:id/assignments",
  authenticate,
  getAssignmentHistory,
);

assignmentRoutes.post(
  "/assets/:id/assignments",
  authenticate,
  authorize("admin"),
  validate(createAssignmentSchema),
  createAssignment,
);

assignmentRoutes.patch(
  "/assignments/:id/return",
  authenticate,
  authorize("admin"),
  validate(returnAssignmentSchema),
  returnAssignment,
);

export default assignmentRoutes;
