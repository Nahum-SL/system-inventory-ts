import bcrypt from "bcrypt";

import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
import { isDuplicateEntryError } from "../../shared/utils/isDuplicateEntryError.js";
import { peopleRepository } from "../people/people.repository.js";
import { usersRepository } from "./users.repository.js";
import type { PublicUser } from "./users.types.js";
import type { CreateUserInput } from "./users.schema.js";

const BCRYPT_COST = 12;

/** Lógica de negocio de las cuentas de usuario. */
export class UsersService {
  /** Lista las cuentas sin exponer contraseñas. */
  async list(): Promise<PublicUser[]> {
    return usersRepository.findAll();
  }

  /** @throws {NotFoundError} Si el usuario no existe (404). */
  async getById(id: number): Promise<PublicUser> {
    const user = await usersRepository.findPublicById(id);

    if (!user) throw new NotFoundError("El usuario no existe");

    return user;
  }

  /**
   * Crea una cuenta para una persona existente.
   * La contraseña se guarda con bcrypt; nunca se devuelve.
   * @throws {NotFoundError} Si la persona no existe (404).
   * @throws {ConflictError} Si la persona ya tiene cuenta o el usuario está en uso (409).
   */
  async create(input: CreateUserInput): Promise<PublicUser> {
    if (!(await peopleRepository.findById(input.personaId))) {
      throw new NotFoundError("La persona indicada no existe");
    }

    if (await usersRepository.personHasUser(input.personaId)) {
      throw new ConflictError("Esta persona ya tiene una cuenta de usuario");
    }

    if (await usersRepository.usernameExists(input.username)) {
      throw new ConflictError("El nombre de usuario ya está registrado");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

    try {
      return await usersRepository.create({
        personaId: input.personaId,
        username: input.username,
        passwordHash,
        rol: input.rol,
      });
    } catch (error) {
      // Condición de carrera: otra petición ganó entre las verificaciones y el insert.
      if (isDuplicateEntryError(error)) {
        const sqlMessage = (error as { sqlMessage?: string }).sqlMessage ?? "";

        throw new ConflictError(
          sqlMessage.includes("persona_id")
            ? "Esta persona ya tiene una cuenta de usuario"
            : "El nombre de usuario ya está registrado",
        );
      }

      throw error;
    }
  }
}

export const usersService = new UsersService();
