import db from "../../database/knex.js";

// Types necesarios para la clase
import type {
  Asset,
  AssetFilters,
  AssetStatus,
  CreateAssetData,
} from "./assets.types.js";

/**
 * Clase Assets que se encargara de mantener la logica de consultas hacia la BD
 * Para la tabla de Activos
 */
export class AssetsRepository {
  private baseQuery() {
    return db("activos as a")
      .innerJoin("marcas as m", "m.id", "a.marca_id")
      .innerJoin("categorias as c", "c.id", "a.categoria_id")
      .innerJoin("areas as ar", "ar.id", "a.area_id")
      .where("a.eliminado", false)
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
        eliminado: "a.eliminado",
        fechaEliminacion: "a.fecha_eliminacion",
      });
  }

  /**
   * Mapea y normaliza Date (Fecha) para devolverlo como cadena
   * Para luego retornar todo los datos de la tabla Activos
   * @param row
   * @returns
   */
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
      eliminado: Boolean(row.eliminado),
      fechaEliminacion:
        row.fechaEliminacion == null ? null : String(row.fechaEliminacion),
    };
  }

  /**
   * Lista a todos los Activos, en forma descendente
   * @param filters
   * @returns
   */
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

    // Almacena lo consulta en la constante rows
    // Retornando las celdas mapeadas
    const rows = await query;
    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Realiza una busqueda de los activos por ID del Registro activos
   * @param id
   * @returns
   */
  async findById(id: number): Promise<Asset | null> {
    const row = await this.baseQuery().where("a.id", id).first();

    // Si lo encuentra devolvera los datos mapeados
    // De lo contrario solo devolvera un vacio / null
    return row ? this.mapRow(row) : null;
  }

  /**
   * Valida que el codigoInventario / QR, exista en la tabla de Activos
   * retornando un True / False
   * @param codigoInventario
   * @returns
   */
  async codeExists(codigoInventario: string): Promise<boolean> {
    const row = await db("activos")
      .select("id")
      .where({ codigo_inventario: codigoInventario })
      .first();

    return Boolean(row);
  }

  /**
   * Realiza una busqueda, validando que si el codigo existe para otro activo
   * @param codigoInventario 
   * @param id 
   * @returns 
   */
  async codeExistsForAnotherAsset(
    codigoInventario: string,
    id: number,
  ): Promise<boolean> {
    const row = await db("activos")
      .select("id")
      .where({ codigo_inventario: codigoInventario })
      .whereNot("id", id)
      .first();

    return Boolean(row);
  }

  /**
   * Valida que el campo de marca , exista en la tabla de Activos
   * retornando un True / False
   * @param id
   * @returns
   */
  async brandExists(id: number): Promise<boolean> {
    const row = await db("marcas").select("id").where({ id }).first();
    return Boolean(row);
  }

  /**
   * Valida que la categoria, exista en la tabla de Activos
   * retornando un True / False
   * @param id
   * @returns
   */
  async categoryExists(id: number): Promise<boolean> {
    const row = await db("categorias").select("id").where({ id }).first();
    return Boolean(row);
  }

  /**
   * Valida que el id del area, exista en la tabla de Activos
   * retornando un True / False
   */
  async areaExists(id: number): Promise<boolean> {
    const row = await db("areas").select("id").where({ id }).first();
    return Boolean(row);
  }

  /**
   * Metodo de crear un nuevo activo
   */
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

    // Usando el metodo findByCode() valida que el codigo QR exista y sea valido
    const created = await this.findByCode(data.codigoInventario);

    if (!created) {
      throw new Error("No se pudo recuperar el activo creado");
    }

    return created;
  }

  /**
   * Metodo que actualizara el estado del Activom recibiendo como parametros
   * @param id
   * @param data
   * @returns
   */
  async update(id: number, data: CreateAssetData): Promise<Asset | null> {
    const updated = await db("activos")
      .where({ id, eliminado: false })
      .update({
        marca_id: data.marcaId,
        categoria_id: data.categoriaId,
        area_id: data.areaId,
        codigo_inventario: data.codigoInventario,
        fechaingreso: data.fechaIngreso,
        descripcion: data.descripcion ?? null,
        estado: data.estado,
      });

    if (!updated) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * Realiza una busqueda por codigo QR
   */
  private async findByCode(codigoInventario: string): Promise<Asset | null> {
    const row = await this.baseQuery()
      .where("a.codigo_inventario", codigoInventario)
      .first();

    return row ? this.mapRow(row) : null;
  }
}

export const assetsRepository = new AssetsRepository();
