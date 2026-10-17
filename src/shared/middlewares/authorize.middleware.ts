import type { RequestHandler } from "express";

// Clases para el Manejo de Errores
import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";
// Type del modulo Users -> ("admin" / "usuario") 
import type { UserRole } from "../../modules/users/users.types.js";

/**
 * Funcion que verifica el rol del usuario, validando que este autenticado antes
 * de poder seguir, si no cuenta con ningun rol (admin, usuario) lo retorna
 */
export function authorize(...allowedRoles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      next(new UnauthorizedError("Debes autenticarte primero"));
      return;
    }

    if (!allowedRoles.includes(req.auth.rol)) {
      next(new ForbiddenError("No tienes permisos para esta operación"));
      return;
    }

    next();
  };
}

// 401 Unauthorized: el usuario no está autenticado o su token no es válido.
// 403 Forbidden: el usuario está autenticado, pero su rol no tiene permiso para realizar la operación.