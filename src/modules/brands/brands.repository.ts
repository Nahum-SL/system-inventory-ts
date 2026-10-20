import db from "../../database/knex.js";
import type {
  Brand,
  BrandRow,
  CreateBrandData,
  UpdateBrandData,
} from "./brands.types.js";

/** Nombre de la tabla de marcas en la base de datos. */
const TABLE = "marcas";

/**
 * Repositorio de acceso a datos para la tabla `marcas`.
 *
 * Solo contiene consultas SQL y el mapeo de filas a objetos `Brand`.
 * Las reglas de negocio (por ejemplo, rechazar marcas duplicadas o
 * devolver 404) deben vivir en la capa de servicio.
 */
export class BrandsRepository {
  /**
   * Consulta base con las columnas públicas de una marca.
   * Centraliza el alias `fecharegistro` -> `fechaRegistro` para no repetirlo.
   */
  private baseQuery() {
    return db(TABLE).select("id", "nombre", {
      fechaRegistro: "fecharegistro",
    });
  }

  /**
   * Convierte una fila de la base de datos en un objeto `Brand`.
   * La fecha siempre se devuelve en formato ISO 8601 (UTC).
   */
  private mapRow(row: BrandRow): Brand {
    return {
      id: Number(row.id),
      nombre: row.nombre,
      fechaRegistro:
        row.fechaRegistro instanceof Date
          ? row.fechaRegistro.toISOString()
          : String(row.fechaRegistro),
    };
  }

  /**
   * Lista todas las marcas ordenadas alfabéticamente por nombre.
   * @returns Arreglo de marcas (vacío si no hay ninguna).
   */
  async findAll(): Promise<Brand[]> {
    const rows = (await this.baseQuery().orderBy(
      "nombre",
      "asc",
    )) as BrandRow[];

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Busca una marca por su id.
   * @param id Identificador de la marca (entero positivo).
   * @returns La marca, o `null` si no existe o el id no es un entero válido.
   */
  async findById(id: number): Promise<Brand | null> {
    if (!Number.isInteger(id)) return null;

    const row = (await this.baseQuery().where({ id }).first()) as
      | BrandRow
      | undefined;

    return row ? this.mapRow(row) : null;
  }

  /**
   * Busca una marca por nombre, sin distinguir mayúsculas/minúsculas.
   * Se usa para detectar duplicados antes de crear o renombrar.
   *
   * @param nombre Nombre a buscar (se le quitan espacios al inicio y al final).
   * @param excludeId Id a ignorar en la búsqueda. Úsalo al actualizar, para
   *   que una marca no se detecte como duplicada de sí misma
   *   (por ejemplo al cambiar "nike" por "Nike").
   * @returns La marca encontrada, o `null` si no hay coincidencia.
   */
  async findByName(nombre: string, excludeId?: number): Promise<Brand | null> {
    const query = this.baseQuery().whereRaw("LOWER(nombre) = LOWER(?)", [
      nombre.trim(),
    ]);

    if (excludeId !== undefined) {
      query.whereNot({ id: excludeId });
    }

    const row = (await query.first()) as BrandRow | undefined;

    return row ? this.mapRow(row) : null;
  }

  /**
   * Crea una marca nueva. `fecharegistro` la asigna la base de datos
   * (debe tener un valor por defecto, por ejemplo `DEFAULT now()`).
   *
   * @param data Datos ya validados de la marca.
   * @returns La marca creada, con su id y fecha de registro.
   * @throws Error si la inserción no devuelve un id o no se puede leer la marca.
   * @throws Error de la base de datos si se viola una restricción
   *   (por ejemplo, un índice único sobre `nombre`).
   */
  async create(data: CreateBrandData): Promise<Brand> {
    const [inserted] = (await db(TABLE)
      .insert({ nombre: data.nombre })
      .returning("id")) as Array<number | string | { id: number | string }>;

    // PostgreSQL devuelve [{ id }]; MySQL/SQLite devuelven [id].
    const id = typeof inserted === "object" ? inserted.id : inserted;

    const brand = await this.findById(Number(id));

    if (!brand) {
      throw new Error("No se pudo recuperar la marca creada");
    }

    return brand;
  }

  /**
   * Actualiza los campos permitidos de una marca.
   * Solo se escriben campos de la lista blanca (`nombre`); cualquier otro
   * campo que llegue en `data` se ignora.
   *
   * @param id Id de la marca a actualizar.
   * @param data Campos a modificar. Si no trae ninguno, no se ejecuta el
   *   UPDATE y se devuelve la marca sin cambios.
   * @returns La marca actualizada, o `null` si no existe.
   */
  async update(id: number, data: UpdateBrandData): Promise<Brand | null> {
    const changes: UpdateBrandData = {};

    if (data.nombre !== undefined) {
      changes.nombre = data.nombre;
    }

    if (Object.keys(changes).length > 0) {
      await db(TABLE).where({ id }).update(changes);
    }

    return this.findById(id);
  }
}

export const brandsRepository = new BrandsRepository();
