import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.js";

/**
 * Middleware global de manejo de errores.
 *
 * - Errores operacionales ({@link AppError}): responden con su código,
 *   mensaje y, si existe, `details` como propiedad aparte.
 * - JSON malformado en el body: responde 400.
 * - Cualquier otro error: se registra en el servidor y el cliente recibe
 *   un mensaje genérico, sin filtrar información interna.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // express.json() lanza un SyntaxError con este type cuando el body no es JSON válido.
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({
      status: "error",
      message: "El cuerpo de la petición no es un JSON válido",
    });
    return;
  }

  console.error("Unexpected error:", err);

  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
  });
};
