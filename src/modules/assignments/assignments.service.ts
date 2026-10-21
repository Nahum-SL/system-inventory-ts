import db from "../../database/knex.js";
// Manejo de errores
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
// ======================
// REPOSITORIOS
// ********************
// Activos
import { assetsRepository } from "../assets/assets.repository.js";
// Asignaciones 
import { assignmentsRepository } from "./assignments.repository.js";
// ======================
// Schema - Asignaciones
import type { CreateAssignmentInput, ReturnAssignmentInput } from "./assignments.shema.js";
// types
import type{Assignment} from "./assignments.types.js";

/**
 * Servicio que manejara la logica de la tabla de asignaciones
 */
export class AssignmentsService {
  async create(
    activoId: number,
    input: CreateAssignmentInput,
  ): Promise<Assignment> {
    const asset = await assetsRepository.findById(activoId);

    if (!asset) {
      throw new NotFoundError("El activo no existe");
    }

    const person = await db("personas")
      .select("id")
      .where({ id: input.personaId })
      .first();

    if (!person) {
      throw new NotFoundError("La persona no existe");
    }

    const position = await db("cargos as c")
      .innerJoin("areas as a", "a.id", "c.area_id")
      .select("c.id")
      .where("c.id", input.cargoId)
      .first();

    if (!position) {
      throw new NotFoundError("El cargo no existe");
    }

    const assignment = await assignmentsRepository.create({
      activoId,
      personaId: input.personaId,
      cargoId: input.cargoId,
      fechaInicio: input.fechaInicio,
      condicionEntrega: input.condicionEntrega,
    });

    if (!assignment) {
      throw new NotFoundError("El activo no existe o fue eliminado");
    }

    return assignment;
  }

  async getHistory(activoId: number): Promise<Assignment[]> {
    const history = await assignmentsRepository.findHistoryByAssetId(activoId);

    if (history === null) {
      throw new NotFoundError("El activo no existe");
    }

    return history;
  }

  async returnAssignment(
    assignmentId: number,
    input: ReturnAssignmentInput,
  ): Promise<Assignment> {
    if (!Number.isSafeInteger(assignmentId) || assignmentId <= 0) {
      throw new ConflictError("El ID de la asignación no es válido");
    }

    const assignment = await assignmentsRepository.returnAssignment({
      assignmentId,
      condicionDevolucion: input.condicionDevolucion,
    });

    if (!assignment) {
      throw new NotFoundError("La asignación no existe");
    }

    return assignment;
  }
}

export const assignmentsService = new AssignmentsService();
