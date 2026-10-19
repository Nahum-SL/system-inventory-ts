import db from "../../database/knex.js";

// types
import type {
  CreateMaintenanceData,
  Maintenance,
  MaintenanceType,
} from "./maintenance.types.js";

/**
 * Repositorio de la tabla Mantenimiento, sera intermediario entre la
 * logica de negocio (servicios, controladores, casos de uso)de la app y
 * la fuente de datos (SQL, API)
 */

export class MaintenanceRepository {
  /**
   * Registra un mantenimiento dentro de una transacción y comprueba que el activo exista y no esté eliminado.
   * @param data
   * @returns
   */
  async create(data: CreateMaintenanceData): Promise<Maintenance | null> {
    return db.transaction(async (trx) => {
      const asset = await trx("activos")
        .select("id")
        .where({
          id: data.activoId,
          eliminado: false,
        })
        .forUpdate()
        .first();

      if (!asset) {
        return null;
      }

      const [insertedId] = await trx("mantenimientos").insert({
        activo_id: data.activoId,
        tipo: data.tipo,
        fecha: data.fecha,
        descripcion: data.descripcion,
        observaciones: data.observaciones ?? null,
        costo: data.costo,
      });

      const row = await trx("mantenimientos as m")
        .innerJoin("activos as a", "a.id", "m.activo_id")
        .select({
          id: "m.id",
          activoId: "m.activo_id",
          codigoInventario: "a.codigo_inventario",
          tipo: "m.tipo",
          fecha: "m.fecha",
          descripcion: "m.descripcion",
          observaciones: "m.observaciones",
          costo: "m.costo",
          fechaRegistro: "m.fecharegistro",
        })
        .where("m.id", insertedId)
        .first();

      if (!row) {
        throw new Error("No se pudo recuperar el mantenimiento registrado");
      }

      return this.mapRow(row);
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

    const rows = await db("mantenimientos as m")
      .innerJoin("activos as a", "a.id", "m.activo_id")
      .select({
        id: "m.id",
        activoId: "m.activo_id",
        codigoInventario: "a.codigo_inventario",
        tipo: "m.tipo",
        fecha: "m.fecha",
        descripcion: "m.descripcion",
        observaciones: "m.observaciones",
        costo: "m.costo",
        fechaRegistro: "m.fecharegistro",
      })
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
      descripcion: String(row.descripcion),
      observaciones:
        row.observaciones == null ? null : String(row.observaciones),
      costo: Number(row.costo),
      fechaRegistro: String(row.fechaRegistro),
    };
  }
}

export const maintenanceRepository = new MaintenanceRepository();
