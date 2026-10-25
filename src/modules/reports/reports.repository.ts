import db from "../../database/knex.js";
// TYPES
import type {
  CountByName,
  DashboardTotals,
  RecentMovement,
} from "./reports.types.js";

type Row = Record<string, unknown>;

/**
 * Consultas de solo lectura para el dashboard. Los activos dados de baja
 * (`eliminado = 1`) no entran en los totales ni en los conteos por catálogo.
 */
export class ReportsRepository {
  async getTotals(): Promise<DashboardTotals> {
    const openAssignmentFor = db("asignaciones as asi")
      .select(db.raw("1"))
      .whereRaw("asi.activo_id = a.id")
      .whereNull("asi.fecha_fin");

    const [byStatus, assigned, available, decommissioned] = await Promise.all([
      db("activos as a")
        .where("a.eliminado", false)
        .select("a.estado")
        .count({ total: "*" })
        .groupBy("a.estado"),
      db("asignaciones as asi")
        .innerJoin("activos as a", "a.id", "asi.activo_id")
        .where("a.eliminado", false)
        .whereNull("asi.fecha_fin")
        .count({ total: "*" })
        .first(),
      db("activos as a")
        .where("a.eliminado", false)
        .where("a.estado", "operativo")
        .whereNotExists(openAssignmentFor)
        .count({ total: "*" })
        .first(),
      db("activos").where({ eliminado: true }).count({ total: "*" }).first(),
    ]);

    const counts = new Map(
      (byStatus as Row[]).map((r) => [String(r.estado), Number(r.total)]),
    );
    const total = [...counts.values()].reduce((sum, n) => sum + n, 0);

    return {
      total,
      operativos: counts.get("operativo") ?? 0,
      enMantenimiento: counts.get("mantenimiento") ?? 0,
      fueraDeServicio: counts.get("fuera_de_servicio") ?? 0,
      asignados: Number((assigned as Row | undefined)?.total ?? 0),
      disponibles: Number((available as Row | undefined)?.total ?? 0),
      dadosDeBaja: Number((decommissioned as Row | undefined)?.total ?? 0),
    };
  }

  /** Cuenta activos por catálogo, incluyendo los que tienen 0 (LEFT JOIN). */
  private async countByCatalog(
    table: "areas" | "categorias",
    foreignKey: "area_id" | "categoria_id",
  ): Promise<CountByName[]> {
    const rows = await db(`${table} as c`)
      .leftJoin("activos as a", function () {
        this.on(`a.${foreignKey}`, "c.id").andOnVal("a.eliminado", "=", 0);
      })
      .select({ id: "c.id", nombre: "c.nombre" })
      .count({ total: "a.id" })
      .groupBy("c.id", "c.nombre")
      .orderBy([
        { column: "total", order: "desc" },
        { column: "c.nombre", order: "asc" },
      ]);

    return (rows as Row[]).map((r) => ({
      id: Number(r.id),
      nombre: String(r.nombre),
      total: Number(r.total),
    }));
  }

  countByArea(): Promise<CountByName[]> {
    return this.countByCatalog("areas", "area_id");
  }

  countByCategory(): Promise<CountByName[]> {
    return this.countByCatalog("categorias", "categoria_id");
  }

  async findRecentMovements(limit = 5): Promise<RecentMovement[]> {
    const rows = await db("movimientos as mv")
      .innerJoin("activos as a", "a.id", "mv.activo_id")
      .leftJoin("areas as origen", "origen.id", "mv.area_origen_id")
      .innerJoin("areas as destino", "destino.id", "mv.area_destino_id")
      .innerJoin("usuarios as u", "u.id", "mv.usuario_id")
      .select({
        id: "mv.id",
        codigoInventario: "a.codigo_inventario",
        areaOrigenNombre: "origen.nombre",
        areaDestinoNombre: "destino.nombre",
        username: "u.username",
        fechaMovimiento: "mv.fecha_movimiento",
      })
      .where("a.eliminado", false)
      .orderBy("mv.fecha_movimiento", "desc")
      .orderBy("mv.id", "desc")
      .limit(limit);

    return (rows as Row[]).map((r) => ({
      id: Number(r.id),
      codigoInventario: String(r.codigoInventario),
      areaOrigenNombre:
        r.areaOrigenNombre == null ? null : String(r.areaOrigenNombre),
      areaDestinoNombre: String(r.areaDestinoNombre),
      username: String(r.username),
      fechaMovimiento: String(r.fechaMovimiento),
    }));
  }
}

export const reportsRepository = new ReportsRepository();
