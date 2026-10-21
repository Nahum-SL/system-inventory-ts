export interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * La clase AppError extiende la clase Error de JavaScript
 * y agrega propiedades adicionales para manejar errores de manera más
 * estructurada en la aplicación.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetail[];

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    details?: ErrorDetail[],
  ) {
    super(message);

    this.name = new.target.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace?.(this, new.target);
  }
}

/**
 * Error 400 para validaciones fallidas. Lleva el detalle por campo
 * en `details`, que el error handler expone como propiedad aparte.
 */
export class ValidationError extends AppError {
  constructor(details: ErrorDetail[], message = "Validación fallida") {
    super(message, 400, true, details);
  }
}
/**
 * Las clases de error específicas extienden la clase AppError y representan
 * diferentes tipos de errores HTTP.
 * Cada clase tiene un mensaje predeterminado y un código de estado HTTP asociado.
 */
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

/**
 * Las clases de error específicas extienden la clase AppError y representan diferentes tipos de errores HTTP.
 * Cada clase tiene un mensaje predeterminado y un código de estado HTTP asociado.
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * Las clases de error específicas extienden la clase AppError y representan diferentes tipos de errores HTTP.
 * Cada clase tiene un mensaje predeterminado y un código de estado HTTP asociado.
 */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/**
 * Las clases de error específicas extienden la clase AppError y representan diferentes tipos de errores HTTP.
 * Cada clase tiene un mensaje predeterminado y un código de estado HTTP asociado.
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Las clases de error específicas extienden la clase AppError y representan diferentes tipos de errores HTTP.
 * Cada clase tiene un mensaje predeterminado y un código de estado HTTP asociado.
 */
export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
  }
}

/** 429: demasiadas peticiones en un periodo corto. */
export class TooManyRequestsError extends AppError {
  constructor(message = "Demasiados intentos. Intenta más tarde.") {
    super(message, 429);
  }
}