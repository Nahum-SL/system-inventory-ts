import { Router } from "express";

// Validacion con el Middleware
import { validate } from "../../shared/middlewares/validate.middleware.js";
// Modulo del Auth
import { loginSchema } from "./auth.schema.js";
import { login } from "./auth.controller.js";

const router = Router();

// Ruta para el login
router.post("/login", validate(loginSchema), login);

export default router;
