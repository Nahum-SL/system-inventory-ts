// shared/utils/asyncHandler.ts
import type { RequestHandler } from "express";

/**
 * Envuelve un handler async y reenvía cualquier error o promesa rechazada
 * a `next`, para que lo procese el error handler global.
 */
export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
