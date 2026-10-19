import db from "../../database/knex.js";

import { ConflictError } from "../../shared/errors/AppError.js";
// types
import type { CreateMovementData, Movement } from "./movements.types.js";

/**
 * Repositorio de la tabla Movimientos, sera intermediario entre la
 * logica de negocio (servicios, controladores, casos de uso)de la app y
 * la fuente de datos (SQL, API)
 */
export class MovementsRepository {
  /**
   * Realiza una busqueda por activo_id
   * devuelve null si el activo no existe y una lista vacía si existe
   * @param activoId 
   * @returns 
   */
  async findHistoryByAssetId(activoId: number): Promise<Movement[] | null> {
    // Consultamos el activo sin filtrar por eliminado,
    // para conservar acceso a su historial histórico.
    const asset = await db("activos")
      .select("id")
      .where({ id: activoId })
      .first();

    if (!asset) {
      return null;
    }

    const rows = await db("movimientos as mv")
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
      })
      .where("mv.activo_id", activoId)
      .orderBy("mv.fecha_movimiento", "desc")
      .orderBy("mv.id", "desc");

    return rows.map((row) => ({
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
    }));
  }

  async create(data: CreateMovementData): Promise<Movement | null> {
    return db.transaction(async (trx) => {
      // Bloqueamos el registro durante el traslado para evitar
      // que dos movimientos simultáneos partan de la misma ubicación.
      const asset = await trx("activos")
        .select("id", "area_id", "codigo_inventario")
        .where({
          id: data.activoId,
          eliminado: false,
        })
        .forUpdate()
        .first();

      if (!asset) {
        return null;
      }

      const areaOrigenId = Number(asset.area_id);
      const areaDestinoId = data.areaDestinoId;

      // Devolverá 409 Conflict, coherente con la situación
      if (areaOrigenId === areaDestinoId) {
        throw new ConflictError("El activo ya se encuentra en esa área");
      }

      const [movementId] = await trx("movimientos").insert({
        activo_id: data.activoId,
        area_origen_id: areaOrigenId,
        area_destino_id: areaDestinoId,
        usuario_id: data.usuarioId,
        motivo: data.motivo?.trim() || null,
      });

      await trx("activos")
        .where({
          id: data.activoId,
          eliminado: false,
        })
        .update({
          area_id: areaDestinoId,
        });

      const row = await trx("movimientos as mv")
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
        })
        .where("mv.id", movementId)
        .first();

      if (!row) {
        throw new Error("No se pudo recuperar el movimiento creado");
      }

      return {
        id: Number(row.id),
        activoId: Number(row.activoId),
        codigoInventario: String(row.codigoInventario),
        areaOrigenId:
          row.areaOrigenId == null ? null : Number(row.areaOrigenId),
        areaOrigenNombre:
          row.areaOrigenNombre == null ? null : String(row.areaOrigenNombre),
        areaDestinoId: Number(row.areaDestinoId),
        areaDestinoNombre: String(row.areaDestinoNombre),
        usuarioId: Number(row.usuarioId),
        username: String(row.username),
        fechaMovimiento: String(row.fechaMovimiento),
        motivo: row.motivo == null ? null : String(row.motivo),
      };
    });
  }
}

export const movementsRepository = new MovementsRepository();
