import { Router } from "express";
// Middlewares
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// Schema
import { createMovementSchema } from "./movements.schema.js";
// Controlador
import { createMovement } from "./movements.controller.js";

const router = Router();

router.use(authenticate);

// Url
router.post(
  "/assets/:id",
  authorize("admin"),
  validate(createMovementSchema),
  createMovement,
);

export default router;
