import db from "../../database/knex.js";
import type { knex } from "knex";
// Manejo de errores
import { ConflictError } from "../../shared/errors/AppError.js";
// Types
import type {
  Assignment,
  CreateAssignmentData,
  CreateAssignmentResult,
  ReturnAssignmentData,
  ReturnAssignmentResult,
} from "./assignments.types.js";

/**
 * Repositorio de la tabla Asignaciones, sera intermediario entre la
 * logica de negocio (servicios, controladores, casos de uso)de la app y
 * la fuente de datos (SQL, API)
 */
export class AssignmentsRepository {
  private mapRow(row: Record<string, unknown>): Assignment {
    const formatDate = (value: unknown): string => {
      if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
      }

      return String(value).slice(0, 10);
    };

    return {
      id: Number(row.id),
      activoId: Number(row.activoId),
      codigoInventario: String(row.codigoInventario),
      personaId: Number(row.personaId),
      personaNombre: `${String(row.apellidos)} ${String(row.nombres)}`,
      cargoId: Number(row.cargoId),
      cargoNombre: String(row.cargoNombre),
      fechaInicio: formatDate(row.fechaInicio),
      fechaFin: row.fechaFin == null ? null : formatDate(row.fechaFin),
      condicionEntrega: String(row.condicionEntrega),
      condicionDevolucion:
        row.condicionDevolucion == null
          ? null
          : String(row.condicionDevolucion),
      informePdf: row.informePdf == null ? null : String(row.informePdf),
      fechaRegistro: String(row.fechaRegistro),
    };
  }

  private queryAssignments(query: typeof db) {
    return query("asignaciones as asi")
      .innerJoin("activos as a", "a.id", "asi.activo_id")
      .innerJoin("personas as p", "p.id", "asi.persona_id")
      .innerJoin("cargos as c", "c.id", "asi.cargo_id")
      .select({
        id: "asi.id",
        activoId: "asi.activo_id",
        codigoInventario: "a.codigo_inventario",
        personaId: "asi.persona_id",
        nombres: "p.nombres",
        apellidos: "p.apellidos",
        cargoId: "asi.cargo_id",
        cargoNombre: "c.nombre",
        fechaInicio: "asi.fecha_inicio",
        fechaFin: "asi.fecha_fin",
        condicionEntrega: "asi.condicion_entrega",
        condicionDevolucion: "asi.condicion_devolucion",
        informePdf: "asi.informe_pdf",
        fechaRegistro: "asi.fecharegistro",
      });
  }

  /**
   * Registra una asignación dentro de una transacción.
   * Bloquea el activo con `FOR UPDATE` y exige que esté `operativo` y sin
   * asignación abierta.
   */
  async create(data: CreateAssignmentData): Promise<CreateAssignmentResult> {
    return db.transaction<CreateAssignmentResult>(async (trx) => {
      const asset = await trx("activos")
        .select("id", "estado")
        .where({ id: data.activoId, eliminado: false })
        .forUpdate()
        .first();

      if (!asset) return { status: "asset_not_found" };

      if (asset.estado !== "operativo") {
        return {
          status: "asset_not_operational",
          estado: String(asset.estado),
        };
      }

      const open = await trx("asignaciones")
        .select("id")
        .where({ activo_id: data.activoId })
        .whereNull("fecha_fin")
        .first();

      if (open) return { status: "already_assigned" };

      const [insertedId] = await trx("asignaciones").insert({
        activo_id: data.activoId,
        persona_id: data.personaId,
        cargo_id: data.cargoId,
        fecha_inicio: data.fechaInicio,
        condicion_entrega: data.condicionEntrega,
      });

      const row = await this.queryAssignments(trx)
        .where("asi.id", insertedId)
        .first();

      if (!row) throw new Error("No se pudo recuperar la asignación creada");

      return { status: "ok", assignment: this.mapRow(row) };
    });
  }

  /**
   * conserva el historial completo, incluso si el activo fue eliminado lógicamente
   * @param activoId
   * @returns
   */
  async findHistoryByAssetId(activoId: number): Promise<Assignment[] | null> {
    const asset = await db("activos")
      .select("id")
      .where({ id: activoId })
      .first();

    if (!asset) {
      return null;
    }

    const rows = await this.queryAssignments(db)
      .where("asi.activo_id", activoId)
      .orderBy("asi.fecha_inicio", "desc")
      .orderBy("asi.id", "desc");

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Cierra una asignación abierta con la fecha y condición de devolución.
   * Mismo orden de bloqueo que mantenimiento y baja: primero el activo.
   */
  async returnAssignment(
    data: ReturnAssignmentData,
  ): Promise<ReturnAssignmentResult> {
    return db.transaction<ReturnAssignmentResult>(async (trx) => {
      const base = await trx("asignaciones")
        .select("activo_id")
        .where({ id: data.assignmentId })
        .first();

      if (!base) return { status: "not_found" };

      await trx("activos")
        .select("id")
        .where({ id: base.activo_id })
        .forUpdate()
        .first();

      const current = await trx("asignaciones")
        .select("fecha_inicio", "fecha_fin")
        .where({ id: data.assignmentId })
        .first();

      if (!current) return { status: "not_found" };
      if (current.fecha_fin !== null) return { status: "already_returned" };

      if (data.fechaFin < String(current.fecha_inicio).slice(0, 10)) {
        return { status: "invalid_dates" };
      }

      await trx("asignaciones").where({ id: data.assignmentId }).update({
        fecha_fin: data.fechaFin,
        condicion_devolucion: data.condicionDevolucion,
      });

      const row = await this.queryAssignments(trx)
        .where("asi.id", data.assignmentId)
        .first();

      if (!row) throw new Error("No se pudo recuperar la asignación devuelta");

      return { status: "ok", assignment: this.mapRow(row) };
    });
  }
}

export const assignmentsRepository = new AssignmentsRepository();
