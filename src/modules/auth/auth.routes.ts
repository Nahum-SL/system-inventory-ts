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
import { changePasswordSchema, loginSchema } from "./auth.schema.js";
import { login, getCurrentUser, changePassword } from "./auth.controller.js";

const authRoutes = Router();

// Ruta para el login
authRoutes.post("/login", loginLimiter, validate(loginSchema), login);
authRoutes.get("/me", authenticate, getCurrentUser);
authRoutes.post(
  "/change-password",
  authenticate,
  loginLimiter,
  validate(changePasswordSchema),
  changePassword,
);

export default authRoutes;
