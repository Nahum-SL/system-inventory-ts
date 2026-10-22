import { UnauthorizedError } from "../../shared/errors/AppError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { authService } from "./auth.service.js";

/** Inicia sesión. El body llega validado. Responde 200 con el token o 401. */
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  res.status(200).json({ status: "success", data: result });
});

/** Cierra sesión limpiando la cookie. */
export const logout = asyncHandler(async (_req, res) => {
  res.status(200).json({ status: "success", message: "Sesión cerrada" });
});

/** Devuelve la cuenta autenticada, leída de la BD. */
export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError("Debes autenticarte primero");

  const user = await authService.getCurrentUser(req.auth.id);

  res.status(200).json({ status: "success", data: { user } });
});
