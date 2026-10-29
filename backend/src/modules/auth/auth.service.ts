import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
// Manejo de errores
import {
  BadRequestError,
  UnauthorizedError,
} from "../../shared/errors/AppError.js";
// Repositorio - USERS
import { usersRepository } from "../users/users.repository.js";
// SCHEMA
import type { ChangePasswordInput, LoginInput } from "./auth.schema.js";
// Types
import type { AuthenticatedUser, LoginResponse } from "./auth.types.js";
import type { PublicUser, UserRole } from "../users/users.types.js";

const BCRYPT_COST = 12;

/**
 * Hash de una contraseña inexistente. Se compara cuando el usuario no existe,
 * para que el tiempo de respuesta sea igual y no revele qué usuarios hay.
 */
const DUMMY_HASH = bcrypt.hashSync("contraseña-ficticia", BCRYPT_COST);

/** Autenticación: login con usuario y contraseña, y consulta de la sesión. */
export class AuthService {
  private signToken(
    user: { id: number; username: string; rol: UserRole },
    tokenVersion: number,
  ): string {
    return jwt.sign(
      { username: user.username, rol: user.rol, ver: tokenVersion },
      env.JWT_SECRET,
      {
        algorithm: "HS256",
        subject: String(user.id),
        expiresIn: env.JWT_EXPIRES_IN,
      },
    );
  }
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

    if (!user.activo) {
      throw new UnauthorizedError(
        "Tu cuenta está desactivada. Contacta al administrador",
      );
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      personaId: user.personaId,
      username: user.username,
      rol: user.rol,
      nombres: user.nombres,
      apellidos: user.apellidos,
    };

    return {
      accessToken: this.signToken(user, user.tokenVersion),
      tokenType: "Bearer",
      expiresIn: env.JWT_EXPIRES_IN,
      user: authenticatedUser,
    };
  }

  /**
   * Cambia la contraseña propia. Cierra todas las demás sesiones de la cuenta y
   * devuelve un token nuevo para que esta sesión continúe.
   * @throws {BadRequestError} Si la contraseña actual es incorrecta (400, no 401: el cliente trata el 401 como sesión vencida).
   */
  async changePassword(userId: number, input: ChangePasswordInput) {
    const user = await usersRepository.findCredentialsById(userId);

    if (!user || !user.activo)
      throw new UnauthorizedError("La cuenta ya no existe");

    if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      throw new BadRequestError("La contraseña actual es incorrecta");
    }

    const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_COST);
    const version = await usersRepository.updatePassword(user.id, passwordHash);

    if (version === null) throw new UnauthorizedError("La cuenta ya no existe");

    return {
      accessToken: this.signToken(user, version),
      expiresIn: env.JWT_EXPIRES_IN,
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
