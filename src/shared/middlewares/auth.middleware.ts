import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

// Configuracion validada de los .env
import { env } from "../../config/env.js";
// Clase para manejar errores
import { UnauthorizedError } from "../errors/AppError.js";

/**
 * Autentica la petición con un JWT enviado en el header
 * `Authorization: Bearer <token>`.
 *
 * Comprueba que:
 * - exista el header con formato Bearer,
 * - la firma sea válida (HS256) y el token no haya expirado,
 * - `sub`, `username` y `rol` tengan el formato esperado.
 *
 * Si todo es correcto, deja `{ id, username, rol }` en `req.auth`.
 *
 * @throws {UnauthorizedError} (401) Si falta el token, es inválido o expiró.
 */
export const authenticate: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Token de autenticación requerido"));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    next(new UnauthorizedError("Token de autenticación requerido"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !/^[1-9]\d*$/.test(payload.sub) ||
      typeof payload.username !== "string" ||
      (payload.rol !== "admin" && payload.rol !== "usuario")
    ) {
      next(new UnauthorizedError("Token inválido"));
      return;
    }

    req.auth = {
      id: Number(payload.sub),
      username: payload.username,
      rol: payload.rol,
    };

    next();
  } catch {
    next(new UnauthorizedError("Token inválido o expirado"));
  }
};
