// Manejo de errores
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
// REPOSITORIO - PEOPLE
import { peopleRepository } from "./people.repository.js";
// SHEMA - PERSONA
import type { CreatePersonInput, UpdatePersonInput } from "./people.schema.js";
// Types
import type { Person, UpdatePersonData } from "./people.types.js";

/**
 * Clase Persona que albergara la logica CR para los controladores
 */
export class PeopleService {
  /**
   * Lista las personas y permite filtrar por nombre, apellido,
   * número de documento o correo electrónico.
   */
  async list(q?: string): Promise<Person[]> {
    const term = q?.trim();

    return peopleRepository.findAll({
      q: term || undefined,
    });
  }

  /**
   * Recupera una persona por su ID.
   */
  async getById(id: number): Promise<Person> {
    const person = await peopleRepository.findById(id);

    if (!person) {
      throw new NotFoundError("La persona no existe");
    }

    return person;
  }

  /**
   * Registra una persona después de verificar sus datos únicos.
   */
  async create(input: CreatePersonInput): Promise<Person> {
    const email = input.email.trim().toLowerCase();

    if (await peopleRepository.documentExists(input.numerodoc)) {
      throw new ConflictError(
        "Ya existe una persona con ese número de documento",
      );
    }

    if (await peopleRepository.emailExists(email)) {
      throw new ConflictError(
        "Ya existe una persona con ese correo electrónico",
      );
    }

    return peopleRepository.create({
      apellidos: input.apellidos,
      nombres: input.nombres,
      tipodoc: input.tipodoc,
      numerodoc: input.numerodoc,
      telefono: input.telefono,
      email,
    });
  }

  /**
   * Actualiza una persona después de verificar el ID existente.
   * Actualizando solo los campos modificados
   * @param id
   * @param input
   * @returns
   */
  async update(id: number, input: UpdatePersonInput): Promise<Person> {
    const existing = await this.getById(id);

    if (
      input.numerodoc !== undefined &&
      input.numerodoc !== existing.numerodoc &&
      (await peopleRepository.documentExists(input.numerodoc))
    ) {
      throw new ConflictError(
        "Ya existe una persona con ese número de documento",
      );
    }

    const email = input.email?.trim().toLowerCase();

    if (
      email !== undefined &&
      email !== existing.email.toLowerCase() &&
      (await peopleRepository.emailExists(email))
    ) {
      throw new ConflictError(
        "Ya existe una persona con ese correo electrónico",
      );
    }
    // 4. Preparar los campos que realmente se enviaron.
    const data: UpdatePersonData = {
      ...input,
      ...(email !== undefined ? { email } : {}),
    };

    // 5. Actualizar y devolver el registro.
    const updated = await peopleRepository.update(id, data);

    if (!updated) {
      throw new NotFoundError("La persona no existe");
    }

    return updated;
  }
}

export const peopleService = new PeopleService();
