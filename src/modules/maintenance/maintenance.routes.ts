import { Router } from "express";
// MIDDLEWARES
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// CONTROLLER - MANTENIMIENTO
import {
  createMaintenance,
  closeMaintenance,
} from "./maintenance.controller.js";
// Schema
import { createMaintenanceSchema } from "./maintenance.shema.js";

const maintenanceRoutes = Router();

maintenanceRoutes.use(authenticate);

maintenanceRoutes.patch("/maintenance/:id/close", closeMaintenance);

maintenanceRoutes.post(
  "/assets/:id/maintenance",
  authorize("admin"),
  validate(createMaintenanceSchema),
  createMaintenance,
);

export default maintenanceRoutes;
