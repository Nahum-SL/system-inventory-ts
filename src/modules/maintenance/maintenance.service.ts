// Manejo de errores
import { NotFoundError } from "../../shared/errors/AppError.js";
// Repositorios
import { assetsRepository } from "../assets/assets.repository.js";
import { maintenanceRepository } from "./maintenance.repository.js";
// types
import type { Maintenance } from "./maintenance.types.js";
import type { CreateMaintenanceData } from "./maintenance.types.js";
// schema - Mantenimiento
import type { CreateMaintenanceInput } from "./maintenance.shema.js";
/**
 * Comprueba que el activo esté disponible antes de registrar el mantenimiento.
 * Delega la persistencia al repositorio.
 * Lanza un 404 Not Found cuando el activo no existe.
 * Permite consultar el historial sin confundir un historial vacío con un activo inexistente.
 */
export class MaintenanceService {
  async create(
    activoId: number,
    input: CreateMaintenanceInput,
  ): Promise<Maintenance> {
    // Verificamos que el activo exista y no esté eliminado.
    const asset = await assetsRepository.findById(activoId);

    if (!asset) {
      throw new NotFoundError("El activo no existe");
    }

    const maintenance = await maintenanceRepository.create({
      activoId,
      tipo: input.tipo,
      fecha: input.fecha,
      descripcion: input.descripcion,
      observaciones: input.observaciones,
      costo: input.costo,
    });

    if (!maintenance) {
      throw new NotFoundError("El activo no existe o ya fue eliminado");
    }

    return maintenance;
  }

  async getHistory(activoId: number): Promise<Maintenance[]> {
    const history = await maintenanceRepository.findHistoryByAssetId(activoId);

    if (history === null) {
      throw new NotFoundError("El activo no existe");
    }

    return history;
  }
}

export const maintenanceService = new MaintenanceService();
