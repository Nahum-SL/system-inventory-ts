// Manejo de errores 
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/errors/AppError.js";
// Maneja el error a un ConflicError 409 
import { withConflictHandling } from "../../shared/utils/withConflictHandling.js";
// REPOSITORIO - ASIGNACIONES
import { peopleRepository } from "../people/people.repository.js";
import { positionsRepository } from "../positions/positions.repository.js";
import { assignmentsRepository } from "./assignments.repository.js";
// Types
import type { Assignment } from "./assignments.types.js";
// SCHEMA
import type {
  CreateAssignmentInput,
  ReturnAssignmentInput,
} from "./assignments.shema.js";

const ALREADY_ASSIGNED =
  "El activo ya tiene una asignación pendiente de devolución";

const NOT_OPERATIONAL: Record<string, string> = {
  mantenimiento: "El activo está en mantenimiento y no se puede asignar",
  fuera_de_servicio: "El activo está fuera de servicio y no se puede asignar",
};

/** Lógica de negocio de las asignaciones de activos a personas. */
export class AssignmentsService {
  /**
   * Asigna un activo a una persona.
   * @throws {NotFoundError} Si el activo (o dado de baja), la persona o el cargo no existen (404).
   * @throws {ConflictError} Si el activo no está operativo o ya está asignado (409).
   */
  async create(
    activoId: number,
    input: CreateAssignmentInput,
  ): Promise<Assignment> {
    if (!(await peopleRepository.findById(input.personaId))) {
      throw new NotFoundError("La persona no existe");
    }

    if (!(await positionsRepository.findById(input.cargoId))) {
      throw new NotFoundError("El cargo no existe");
    }

    const result = await withConflictHandling(
      () => assignmentsRepository.create({ activoId, ...input }),
      ALREADY_ASSIGNED,
    );

    switch (result.status) {
      case "asset_not_found":
        throw new NotFoundError("El activo no existe o fue dado de baja");
      case "asset_not_operational":
        throw new ConflictError(
          NOT_OPERATIONAL[result.estado] ?? "El activo no está operativo",
        );
      case "already_assigned":
        throw new ConflictError(ALREADY_ASSIGNED);
      case "ok":
        return result.assignment;
    }
  }

  /** @throws {NotFoundError} Si el activo no existe (404). */
  async getHistory(activoId: number): Promise<Assignment[]> {
    const history = await assignmentsRepository.findHistoryByAssetId(activoId);

    if (history === null) throw new NotFoundError("El activo no existe");

    return history;
  }

  /**
   * Registra la devolución de un activo.
   * @throws {NotFoundError} Si la asignación no existe (404).
   * @throws {ConflictError} Si ya fue devuelta (409).
   * @throws {BadRequestError} Si la fecha de fin es anterior al inicio (400).
   */
  async returnAssignment(
    assignmentId: number,
    input: ReturnAssignmentInput,
  ): Promise<Assignment> {
    const result = await assignmentsRepository.returnAssignment({
      assignmentId,
      ...input,
    });

    switch (result.status) {
      case "not_found":
        throw new NotFoundError("La asignación no existe");
      case "already_returned":
        throw new ConflictError("Esta asignación ya fue devuelta");
      case "invalid_dates":
        throw new BadRequestError(
          "La fecha de devolución no puede ser anterior a la de inicio",
        );
      case "ok":
        return result.assignment;
    }
  }
}

export const assignmentsService = new AssignmentsService();
