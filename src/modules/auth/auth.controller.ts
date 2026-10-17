
import type { RequestHandler } from "express";

// Auth Servicio
import { authService } from "./auth.service.js";

// Clase de manejo de Errores
import { UnauthorizedError } from "../../shared/errors/AppError.js";

/**
 * Se encarga de recibir la peticion HTTP, invocar el servicio y devolver la respuesta
 * No contiene SQL ni logica de contraseñas
 */
export const login: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/** 
 * Controlador para obtener usuario, validando de que cuente con un rol y autenticacion 
 */
export const getCurrentUser: RequestHandler = (req, res, next) => {
  try {
    if (!req.auth) {
      next(new UnauthorizedError("Debes autenticarte primero"));
      return;
    }

    res.status(200).json({
      status: "success",
      data: {
        user: req.auth,
      },
    });
  } catch (error) {
    next(error);
  }
};