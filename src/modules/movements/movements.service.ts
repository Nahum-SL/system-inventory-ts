// MANEJO DE ERRORES
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
// REPOSITORIO - ACTIVOS
import { assetsRepository } from "../assets/assets.repository.js";
// REPOSITORIO - MOVIMIENTOS
import { movementsRepository } from "./movements.repository.js";
// SCHEMA
import type { CreateMovementInput } from "./movements.schema.js";
// TYPES
import type { Movement } from "./movements.types.js";

/**
 * Clase que contendra la logica CRUD
 */
export class MovementsService {
  async create(
    activoId: number,
    usuarioId: number,
    input: CreateMovementInput,
  ): Promise<Movement> {
    const asset = await assetsRepository.findById(activoId);

    if (!asset) {
      throw new NotFoundError("El activo no existe o está dado de baja");
    }

    const destinationExists = await assetsRepository.areaExists(
      input.areaDestinoId,
    );

    if (!destinationExists) {
      throw new NotFoundError("El área de destino no existe");
    }

    if (asset.areaId === input.areaDestinoId) {
      throw new ConflictError("El activo ya se encuentra en esa área");
    }

    const movement = await movementsRepository.create({
      activoId,
      areaDestinoId: input.areaDestinoId,
      usuarioId,
      motivo: input.motivo,
    });

    if (!movement) {
      throw new NotFoundError(
        "No se pudo registrar el movimiento; comprueba que el activo siga disponible",
      );
    }

    return movement;
  }
}

export const movementsService = new MovementsService();