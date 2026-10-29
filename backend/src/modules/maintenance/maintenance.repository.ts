import db from "../../database/knex.js";

import type { Knex } from "knex";

// types
import type {
  Maintenance,
  CreateMaintenanceData,
  CloseMaintenanceData,
  MaintenanceType,
  CloseMaintenanceResult,
  CreateMaintenanceResult,
} from "./maintenance.types.js";

/**
 * Repositorio de la tabla Mantenimiento, sera intermediario entre la
 * logica de negocio (servicios, controladores, casos de uso)de la app y
 * la fuente de datos (SQL, API)
 */
export class MaintenanceRepository {
  private selectMaintenance(conn: Knex | Knex.Transaction) {
    return conn("mantenimientos as m")
      .innerJoin("activos as a", "a.id", "m.activo_id")
      .select({
        id: "m.id",
        activoId: "m.activo_id",
        codigoInventario: "a.codigo_inventario",
        tipo: "m.tipo",
        fecha: "m.fecha",
        fechaFin: "m.fecha_fin",
        descripcion: "m.descripcion",
        observaciones: "m.observaciones",
        costo: "m.costo",
        fechaRegistro: "m.fecharegistro",
      });
  }

  async create(data: CreateMaintenanceData): Promise<CreateMaintenanceResult> {
    return db.transaction(async (trx) => {
      const asset = await trx("activos")
        .select("id", "estado")
        .where({ id: data.activoId, eliminado: false })
        .forUpdate()
        .first();

      if (!asset) return { status: "asset_not_found" };

      const open = await trx("mantenimientos")
        .select("id")
        .where({ activo_id: data.activoId })
        .whereNull("fecha_fin")
        .first();

      if (open || asset.estado === "mantenimiento") {
        return { status: "already_open" };
      }

      const [insertedId] = await trx("mantenimientos").insert({
        activo_id: data.activoId,
        tipo: data.tipo,
        fecha: data.fecha,
        descripcion: data.descripcion,
        observaciones: data.observaciones ?? null,
        costo: data.costo,
      });

      await trx("activos")
        .where({ id: data.activoId })
        .update({ estado: "mantenimiento" });

      const row = await this.selectMaintenance(trx)
        .where("m.id", insertedId)
        .first();
      if (!row)
        throw new Error("No se pudo recuperar el mantenimiento registrado");

      return { status: "ok", maintenance: this.mapRow(row) };
    });
  }

  async close(
    id: number,
    data: CloseMaintenanceData,
  ): Promise<CloseMaintenanceResult> {
    return db.transaction(async (trx) => {
      // Mismo orden de bloqueo que create: primero el activo, luego el mantenimiento.
      const base = await trx("mantenimientos")
        .select("activo_id")
        .where({ id })
        .first();
      if (!base) return { status: "not_found" };

      await trx("activos")
        .select("id")
        .where({ id: base.activo_id })
        .forUpdate()
        .first();

      const current = await trx("mantenimientos").where({ id }).first();
      if (!current) return { status: "not_found" };
      if (current.fecha_fin !== null) return { status: "already_closed" };

      if (data.fechaFin < String(current.fecha).slice(0, 10)) {
        return { status: "invalid_dates" };
      }

      await trx("mantenimientos")
        .where({ id })
        .update({
          fecha_fin: data.fechaFin,
          ...(data.observaciones !== undefined
            ? { observaciones: data.observaciones }
            : {}),
          ...(data.costo !== undefined ? { costo: data.costo } : {}),
        });

      await trx("activos")
        .where({ id: base.activo_id })
        .update({ estado: data.resultado });

      const row = await this.selectMaintenance(trx).where("m.id", id).first();
      if (!row)
        throw new Error("No se pudo recuperar el mantenimiento cerrado");

      return { status: "ok", maintenance: this.mapRow(row) };
    });
  }

  /**
   * Rrecupera el historial ordenado por fecha, del más reciente al más antiguo.
   * Devuelve null si el activo no existey un arreglo vacío si existe,
   * pero todavía no tiene mantenimientos.
   * @param activoId
   * @returns
   */
  async findHistoryByAssetId(activoId: number): Promise<Maintenance[] | null> {
    const asset = await db("activos")
      .select("id")
      .where({ id: activoId })
      .first();

    if (!asset) {
      return null;
    }
    
    const rows = await this.selectMaintenance(db)      
      .where("m.activo_id", activoId)
      .orderBy("m.fecha", "desc")
      .orderBy("m.id", "desc");

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Mapea los datos de la tabla
   * @param row
   * @returns
   */
  private mapRow(row: Record<string, unknown>): Maintenance {
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
      tipo: row.tipo as MaintenanceType,
      fecha: formatDate(row.fecha),
      fechaFin: row.fechaFin == null ? null : formatDate(row.fechaFin),
      descripcion: String(row.descripcion),
      observaciones:
      row.observaciones == null ? null : String(row.observaciones),
      costo: Number(row.costo),
      fechaRegistro: String(row.fechaRegistro),
    };
  }
}

export const maintenanceRepository = new MaintenanceRepository();
