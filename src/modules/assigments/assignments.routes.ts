import { Router } from "express";
// CONTROLLER - ASIGNMENTS / ASIGNACIONES
import {
    createAssignment,
    getAssignmentHistory,
    returnAssignment,
} from "./assignments.controller.js";
// SCHEMA - ASSIGNMENTS / ASIGNACIONES
import { createAssignmentSchema, returnAssignmentSchema } from "./assignments.shema.js";
// MIDDLEWARES
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";

const assignmentRoutes = Router();

// Restringe el ENDPOINT para que lo use solo el usuario Autenticado
assignmentRoutes.use(authenticate);

// ENDPOINTS
assignmentRoutes.get("/assets/:id", getAssignmentHistory);

assignmentRoutes.post(
  "/assets/:id",
  authorize("admin"),
  validate(createAssignmentSchema),
  createAssignment,
);

assignmentRoutes.patch(
  "/:id/return",
  authorize("admin"),
  validate(returnAssignmentSchema),
  returnAssignment,
);

export default assignmentRoutes;
