import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
// Manejo de errores
import { UnauthorizedError } from "../../shared/errors/AppError.js";
// Repositorio - USERS
import { usersRepository } from "../users/users.repository.js";
// SCHEMA
import type { LoginInput } from "./auth.schema.js";
// Types
import type { AuthenticatedUser, LoginResponse } from "./auth.types.js";
import type { PublicUser } from "../users/users.types.js";

const BCRYPT_COST = 12;

/**
 * Hash de una contraseña inexistente. Se compara cuando el usuario no existe,
 * para que el tiempo de respuesta sea igual y no revele qué usuarios hay.
 */
const DUMMY_HASH = bcrypt.hashSync("contraseña-ficticia", BCRYPT_COST);

/** Autenticación: login con usuario y contraseña, y consulta de la sesión. */
export class AuthService {
  /**
   * Valida las credenciales y emite un JWT con id (`sub`), usuario y rol.
   * Usuario inexistente y contraseña incorrecta responden igual.
   * @throws {UnauthorizedError} Si las credenciales son incorrectas (401).
   */
  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await usersRepository.findCredentialsByUsername(
      input.username,
    );

    const passwordIsValid = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !passwordIsValid) {
      throw new UnauthorizedError("Usuario o contraseña incorrectos");
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      personaId: user.personaId,
      username: user.username,
      rol: user.rol,
      nombres: user.nombres,
      apellidos: user.apellidos,
    };

    const accessToken = jwt.sign(
      { username: user.username, rol: user.rol },
      env.JWT_SECRET,
      {
        algorithm: "HS256",
        subject: String(user.id),
        expiresIn: env.JWT_EXPIRES_IN,
      },
    );

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: env.JWT_EXPIRES_IN,
      user: authenticatedUser,
    };
  }

  /**
   * Devuelve los datos actuales de la cuenta autenticada, leídos de la BD.
   * @throws {UnauthorizedError} Si la cuenta ya no existe (401).
   */
  async getCurrentUser(userId: number): Promise<PublicUser> {
    const user = await usersRepository.findPublicById(userId);

    if (!user) throw new UnauthorizedError("La cuenta ya no existe");

    return user;
  }
}

export const authService = new AuthService();
