import { Router } from "express";
// MIDDLEWARES
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// CONTROLLER - MANTENIMIENTO
import {
  createMaintenance,
  getMaintenanceHistory,
} from "./maintenance.controller.js";
// Schema
import { createMaintenanceSchema } from "./maintenance.shema.js";

const maintenanceRoutes = Router();

maintenanceRoutes.use(authenticate);

maintenanceRoutes.get("/assets/:id", getMaintenanceHistory);

maintenanceRoutes.post(
  "/assets/:id",
  authorize("admin"),
  validate(createMaintenanceSchema),
  createMaintenance,
);

export default maintenanceRoutes;
