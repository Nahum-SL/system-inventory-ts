import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
import { areasRepository } from "../areas/areas.repository.js";
import { movementsRepository } from "./movements.repository.js";
import type { CreateMovementInput } from "./movements.schema.js";
import type { Movement } from "./movements.types.js";

/** Lógica de negocio de los traslados de activos entre áreas. */
export class MovementsService {
  /** @throws {NotFoundError} Si el activo no existe (404). */
  async getHistory(activoId: number): Promise<Movement[]> {
    const history = await movementsRepository.findHistoryByAssetId(activoId);

    if (history === null) throw new NotFoundError("El activo no existe");

    return history;
  }

  /**
   * Traslada un activo a otra área y registra quién lo hizo.
   * @throws {NotFoundError} Si el activo (o dado de baja) o el área destino no existen (404).
   * @throws {ConflictError} Si el activo ya está en esa área (409).
   */
  async create(
    activoId: number,
    usuarioId: number,
    input: CreateMovementInput,
  ): Promise<Movement> {
    if (!(await areasRepository.findById(input.areaDestinoId))) {
      throw new NotFoundError("El área de destino no existe");
    }

    const result = await movementsRepository.create({
      activoId,
      usuarioId,
      areaDestinoId: input.areaDestinoId,
      motivo: input.motivo,
    });

    switch (result.status) {
      case "asset_not_found":
        throw new NotFoundError("El activo no existe o fue dado de baja");
      case "same_area":
        throw new ConflictError("El activo ya se encuentra en esa área");
      case "ok":
        return result.movement;
    }
  }
}

export const movementsService = new MovementsService();
