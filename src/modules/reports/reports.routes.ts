import { Router } from "express";
// MIDDLEWARE
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
// CONTROLLER
import { getSummary } from "./reports.controller.js";

const reportsRoutes = Router();

// ENDPOINTS
reportsRoutes.use(authenticate, authorize("admin"));
reportsRoutes.get("/summary", getSummary);

export default reportsRoutes;
