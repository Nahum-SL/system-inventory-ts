import { Router } from "express";
// MIDDLEWARES
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// CONTROLLER - MANTENIMIENTO
import {
  createMaintenance,
  closeMaintenance,
  getMaintenanceHistory,
} from "./maintenance.controller.js";
// Schema
import {
  createMaintenanceSchema,
  closeMaintenanceSchema,
} from "./maintenance.shema.js";

const maintenanceRoutes = Router();

maintenanceRoutes.use(authenticate);

maintenanceRoutes.get(
  "/assets/:id/maintenance",
  authenticate,
  getMaintenanceHistory,
);

maintenanceRoutes.post(
  "/assets/:id/maintenance",
  authenticate,
  authorize("admin"),
  validate(createMaintenanceSchema),
  createMaintenance,
);

maintenanceRoutes.patch(
  "/maintenance/:id/close",
  authenticate,
  authorize("admin"),
  validate(closeMaintenanceSchema),
  closeMaintenance,
);

export default maintenanceRoutes;
