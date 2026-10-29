import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { usersRepository } from "../../modules/users/users.repository.js";
import { UnauthorizedError } from "../errors/AppError.js";

/**
 * Autentica con un JWT en `Authorization: Bearer <token>` y confirma contra la BD
 * que la cuenta siga activa y que el token no haya sido invalidado
 * (cambio de contraseña o desactivación). El rol sale de la BD, no del token.
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
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

  let payload: jwt.JwtPayload | string;

  try {
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    next(new UnauthorizedError("Token inválido o expirado"));
    return;
  }

  if (
    typeof payload === "string" ||
    typeof payload.sub !== "string" ||
    !/^[1-9]\d*$/.test(payload.sub) ||
    typeof payload.ver !== "number"
  ) {
    next(new UnauthorizedError("Token inválido"));
    return;
  }

  try {
    const account = await usersRepository.findAuthState(Number(payload.sub));

    if (!account || !account.activo || account.tokenVersion !== payload.ver) {
      next(new UnauthorizedError("La sesión ya no es válida"));
      return;
    }

    req.auth = { id: account.id, username: account.username, rol: account.rol };
    next();
  } catch (error) {
    next(error);
  }
};
