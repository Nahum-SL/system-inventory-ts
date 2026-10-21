import type { Knex } from "knex";
import db from "../../database/knex.js";
// Types
import type {
  CreateMovementData,
  CreateMovementResult,
  Movement,
} from "./movements.types.js";

export class MovementsRepository {
  private selectMovements(conn: Knex | Knex.Transaction) {
    return conn("movimientos as mv")
      .innerJoin("activos as a", "a.id", "mv.activo_id")
      .leftJoin("areas as origen", "origen.id", "mv.area_origen_id")
      .innerJoin("areas as destino", "destino.id", "mv.area_destino_id")
      .innerJoin("usuarios as u", "u.id", "mv.usuario_id")
      .select({
        id: "mv.id",
        activoId: "mv.activo_id",
        codigoInventario: "a.codigo_inventario",
        areaOrigenId: "mv.area_origen_id",
        areaOrigenNombre: "origen.nombre",
        areaDestinoId: "mv.area_destino_id",
        areaDestinoNombre: "destino.nombre",
        usuarioId: "mv.usuario_id",
        username: "u.username",
        fechaMovimiento: "mv.fecha_movimiento",
        motivo: "mv.motivo",
      });
  }

  private mapRow(row: Record<string, unknown>): Movement {
    return {
      id: Number(row.id),
      activoId: Number(row.activoId),
      codigoInventario: String(row.codigoInventario),
      areaOrigenId: row.areaOrigenId == null ? null : Number(row.areaOrigenId),
      areaOrigenNombre:
        row.areaOrigenNombre == null ? null : String(row.areaOrigenNombre),
      areaDestinoId: Number(row.areaDestinoId),
      areaDestinoNombre: String(row.areaDestinoNombre),
      usuarioId: Number(row.usuarioId),
      username: String(row.username),
      fechaMovimiento: String(row.fechaMovimiento),
      motivo: row.motivo == null ? null : String(row.motivo),
    };
  }

  /**
   * Historial de traslados de un activo, del más reciente al más antiguo.
   * No filtra `eliminado`: un activo dado de baja conserva su historial.
   * Devuelve `null` si el activo no existe y `[]` si existe sin traslados.
   */
  async findHistoryByAssetId(activoId: number): Promise<Movement[] | null> {
    const asset = await db("activos")
      .select("id")
      .where({ id: activoId })
      .first();

    if (!asset) return null;

    const rows = await this.selectMovements(db)
      .where("mv.activo_id", activoId)
      .orderBy("mv.fecha_movimiento", "desc")
      .orderBy("mv.id", "desc");

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Traslada un activo a otra área dentro de una transacción.
   *
   * Bloquea el activo con `FOR UPDATE` (mismo orden que mantenimiento,
   * asignaciones y baja), toma el área de origen de la fila bloqueada, inserta
   * el movimiento y actualiza `activos.area_id` de forma atómica.
   *
   * @returns `asset_not_found` (no existe o dado de baja), `same_area`
   * (el activo ya está en el destino) u `ok`.
   */
  async create(data: CreateMovementData): Promise<CreateMovementResult> {
    return db.transaction<CreateMovementResult>(async (trx) => {
      const asset = await trx("activos")
        .select("id", "area_id")
        .where({ id: data.activoId, eliminado: false })
        .forUpdate()
        .first();

      if (!asset) return { status: "asset_not_found" };

      const areaOrigenId = Number(asset.area_id);

      if (areaOrigenId === data.areaDestinoId) return { status: "same_area" };

      const [movementId] = await trx("movimientos").insert({
        activo_id: data.activoId,
        area_origen_id: areaOrigenId,
        area_destino_id: data.areaDestinoId,
        usuario_id: data.usuarioId,
        motivo: data.motivo || null,
      });

      await trx("activos")
        .where({ id: data.activoId })
        .update({ area_id: data.areaDestinoId });

      const row = await this.selectMovements(trx)
        .where("mv.id", movementId)
        .first();

      if (!row) throw new Error("No se pudo recuperar el movimiento creado");

      return { status: "ok", movement: this.mapRow(row) };
    });
  }
}

export const movementsRepository = new MovementsRepository();
