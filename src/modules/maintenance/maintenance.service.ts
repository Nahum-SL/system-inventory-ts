import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from "../../shared/errors/AppError.js";
import { withConflictHandling } from "../../shared/utils/withConflictHandling.js";
import { maintenanceRepository } from "./maintenance.repository.js";
import type { Maintenance } from "./maintenance.types.js";

import type {
  CloseMaintenanceInput,
  CreateMaintenanceInput,
} from "./maintenance.shema.js";

const OPEN_MESSAGE = "El activo ya tiene un mantenimiento en curso";

export class MaintenanceService {
  /**
   * Abre un mantenimiento y pone el activo en estado `mantenimiento`.
   * @throws {NotFoundError} Si el activo no existe o fue dado de baja (404).
   * @throws {ConflictError} Si ya hay un mantenimiento abierto (409).
   */
  async create(
    activoId: number,
    input: CreateMaintenanceInput,
  ): Promise<Maintenance> {
    const result = await withConflictHandling(
      () => maintenanceRepository.create({ activoId, ...input }),
      OPEN_MESSAGE,
    );

    if (result.status === "asset_not_found") {
      throw new NotFoundError("El activo no existe o fue dado de baja");
    }
    if (result.status === "already_open") {
      throw new ConflictError(OPEN_MESSAGE);
    }

    return result.maintenance;
  }

  /**
   * Cierra un mantenimiento y deja el activo en el estado indicado.
   * @throws {NotFoundError} Si el mantenimiento no existe (404).
   * @throws {ConflictError} Si ya estaba cerrado (409).
   * @throws {BadRequestError} Si la fecha de fin es anterior al inicio (400).
   */
  async close(id: number, input: CloseMaintenanceInput): Promise<Maintenance> {
    const result = await maintenanceRepository.close(id, input);

    if (result.status === "not_found")
      throw new NotFoundError("El mantenimiento no existe");
    if (result.status === "already_closed")
      throw new ConflictError("El mantenimiento ya fue cerrado");
    if (result.status === "invalid_dates") {
      throw new BadRequestError(
        "La fecha de fin no puede ser anterior a la de inicio",
      );
    }

    return result.maintenance;
  }

  async getHistory(activoId: number): Promise<Maintenance[]> {
    const history = await maintenanceRepository.findHistoryByAssetId(activoId);

    if (history === null) throw new NotFoundError("El activo no existe");

    return history;
  }
}

export const maintenanceService = new MaintenanceService();
