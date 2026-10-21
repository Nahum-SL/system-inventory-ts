import { Router } from "express";

// ================
// Middleware
// ================
// Validacion
import { validate } from "../../shared/middlewares/validate.middleware.js";
// autenticacion
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { loginLimiter } from "../../shared/middlewares/loginLimit.middleware.js";

// MODULO - Auth
import { loginSchema } from "./auth.schema.js";
import { login, getCurrentUser } from "./auth.controller.js";

const authRoutes = Router();

// Ruta para el login
authRoutes.post("/login", loginLimiter, validate(loginSchema), login);
authRoutes.get("/me", authenticate, getCurrentUser);

export default authRoutes;
