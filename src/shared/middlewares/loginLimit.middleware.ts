import { rateLimit } from "express-rate-limit";
import { TooManyRequestsError } from "../errors/AppError.js";

/**
 * Limita los intentos de login por IP. Solo cuentan los intentos fallidos,
 * para no bloquear a una oficina entera que comparte IP.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new TooManyRequestsError()),
});
