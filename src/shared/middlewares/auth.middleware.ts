import type { RequestHandler } from "express";

import jwt from "jsonwebtoken";

// Configuracion validada de los .env
import { env } from "../../config/env.js";

// Clase para manejar errores de JS
import { UnauthorizedError } from "../errors/AppError.js";

/**
 * Constante que servira para comprobar que exista
 * Encabezado Authorization,
 * Formato Bearer Token,
 * La firma sea válida y el token no haya expirado,
 * El ID, nombre y rol de usuario tengan el formato esperado
 */
export const authenticate: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization;

  // Si el bearer no se encuentra
  if (!authorization?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Token de autenticación requerido"));
    return;
  }

  // Almacena el valor del Bearer en la variable token
  const token = authorization.slice("Bearer ".length).trim();

  // Si el token no esta muestra el siguiente mensaje
  if (!token) {
    next(new UnauthorizedError("Token de autenticación requerido"));
    return;
  }

  try {
    // se almacena el token y verifica con el JWT_SECRET validado
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

    // Si todo esta bien, retorna el id, nombre y rol del usuario
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
