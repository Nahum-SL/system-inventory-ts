import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../shared/errors/AppError.js";
import { usersRepository } from "../users/users.repository.js";

import type { LoginInput } from "./auth.schema.js";
import type { AuthenticatedUser, LoginResponse } from "./auth.types.js";

/**
 * Sera encargado de comparar la contraseña recibida con el hash guardados
 * Y rechazar las credenciales incorrectas con el mismo mensaje.
 * Genera un JWT con el ID, NOMBRE USUARIO y ROL.
 * Devuelve un token y los datos publicos del usuario, sin exponer el hash
 * @example
 * Autservice(password)
 */
export class AuthService {
  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await usersRepository.findCredentialsByUsername(
      input.username,
    );

    // Usamos el mismo mensaje para no revelar si el usuario existe.
    if (!user) {
      throw new UnauthorizedError("Usuario o contraseña incorrectos");
    }

    const passwordIsValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
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
      {
        username: user.username,
        rol: user.rol,
      },
      env.JWT_SECRET,
      {
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
}

export const authService = new AuthService();
