import db from "../../database/knex.js";

import type {
  Asset,
  AssetFilters,
  AssetStatus,
  CreateAssetData,
} from "./assets.types.js";

export class AssetsRepository {
  private baseQuery() {
    return db("activos as a")
      .innerJoin("marcas as m", "m.id", "a.marca_id")
      .innerJoin("categorias as c", "c.id", "a.categoria_id")
      .innerJoin("areas as ar", "ar.id", "a.area_id")
      .select({
        id: "a.id",
        marcaId: "a.marca_id",
        marcaNombre: "m.nombre",
        categoriaId: "a.categoria_id",
        categoriaNombre: "c.nombre",
        areaId: "a.area_id",
        areaNombre: "ar.nombre",
        codigoInventario: "a.codigo_inventario",
        fechaIngreso: "a.fechaingreso",
        descripcion: "a.descripcion",
        estado: "a.estado",
        fechaRegistro: "a.fecharegistro",
      });
  }

  private mapRow(row: Record<string, any>): Asset {
    const normalizeDate = (value: unknown): string => {
      if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
      }

      return String(value).slice(0, 10);
    };

    return {
      id: Number(row.id),
      marcaId: Number(row.marcaId),
      marcaNombre: String(row.marcaNombre),
      categoriaId: Number(row.categoriaId),
      categoriaNombre: String(row.categoriaNombre),
      areaId: Number(row.areaId),
      areaNombre: String(row.areaNombre),
      codigoInventario: String(row.codigoInventario),
      fechaIngreso: normalizeDate(row.fechaIngreso),
      descripcion: row.descripcion == null ? null : String(row.descripcion),
      estado: row.estado as AssetStatus,
      fechaRegistro: String(row.fechaRegistro),
    };
  }

  async findAll(filters: AssetFilters = {}): Promise<Asset[]> {
    const query = this.baseQuery().orderBy("a.id", "desc");

    if (filters.estado) {
      query.where("a.estado", filters.estado);
    }

    if (filters.areaId !== undefined) {
      query.where("a.area_id", filters.areaId);
    }

    if (filters.q?.trim()) {
      const term = `%${filters.q.trim()}%`;

      query.where((builder) => {
        builder
          .whereLike("a.codigo_inventario", term)
          .orWhereLike("a.descripcion", term)
          .orWhereLike("m.nombre", term)
          .orWhereLike("c.nombre", term)
          .orWhereLike("ar.nombre", term);
      });
    }

    const rows = await query;
    return rows.map((row) => this.mapRow(row));
  }

  async findById(id: number): Promise<Asset | null> {
    const row = await this.baseQuery().where("a.id", id).first();

    return row ? this.mapRow(row) : null;
  }

  async codeExists(codigoInventario: string): Promise<boolean> {
    const row = await db("activos")
      .select("id")
      .where({ codigo_inventario: codigoInventario })
      .first();

    return Boolean(row);
  }

  async brandExists(id: number): Promise<boolean> {
    const row = await db("marcas").select("id").where({ id }).first();
    return Boolean(row);
  }

  async categoryExists(id: number): Promise<boolean> {
    const row = await db("categorias").select("id").where({ id }).first();
    return Boolean(row);
  }

  async areaExists(id: number): Promise<boolean> {
    const row = await db("areas").select("id").where({ id }).first();
    return Boolean(row);
  }

  async create(data: CreateAssetData): Promise<Asset> {
    await db("activos").insert({
      marca_id: data.marcaId,
      categoria_id: data.categoriaId,
      area_id: data.areaId,
      codigo_inventario: data.codigoInventario,
      fechaingreso: data.fechaIngreso,
      descripcion: data.descripcion ?? null,
      estado: data.estado,
    });

    const created = await this.findByCode(data.codigoInventario);

    if (!created) {
      throw new Error("No se pudo recuperar el activo creado");
    }

    return created;
  }

  private async findByCode(codigoInventario: string): Promise<Asset | null> {
    const row = await this.baseQuery()
      .where("a.codigo_inventario", codigoInventario)
      .first();

    return row ? this.mapRow(row) : null;
  }
}

export const assetsRepository = new AssetsRepository();
