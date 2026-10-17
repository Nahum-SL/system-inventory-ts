// Este middleware de manejo de errores captura los errores que ocurren en la aplicación 
// y envía una respuesta adecuada al cliente.
import type { ErrorRequestHandler } from "express";
// Importa la clase AppError desde el archivo de errores personalizado
import { AppError } from "../errors/AppError.js";

/**
 * Middleware de manejo de errores para capturar y responder a los errores en la aplicación.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  // Si los encabezados de la respuesta ya se han enviado, pasa el error al siguiente middleware
  if (res.headersSent) {
    next(err);
    return;
  }

  // Si el error es una instancia de AppError, envía una respuesta con el código de estado y mensaje del error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // Unexpected errors: keep details in server logs only.
  console.error("Unexpected error:", err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
