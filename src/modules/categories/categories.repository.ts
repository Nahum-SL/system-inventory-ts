import db from "../../database/knex.js";

// types
import type {
  Category,
  CategoryRow,
  CreateCategoryData,
  UpdateCategoryData,
} from "./categories.types.js";

/**
 * Repositorio de acceso a datos de la tabla `categorias`.
 *
 * Encapsula las consultas SQL (vía Knex) y devuelve resultados normalizados
 * al modelo de dominio {@link Category}. No contiene reglas de negocio ni
 * validaciones de entrada: eso corresponde a la capa de servicio.
 *
 * Convenciones de la tabla (InnoDB):
 * - La columna `fecharegistro` está en minúsculas; el dominio usa camelCase
 *   (`fechaRegistro`). La conversión se hace con alias en cada SELECT.
 * - `nombre` es `NOT NULL` y tiene restricción `UNIQUE`.
 * - `fecharegistro` es `NOT NULL` con default `CURRENT_TIMESTAMP`.
 * - `activos.categoria_id` referencia `categorias.id` con `ON DELETE RESTRICT`,
 *   por lo que una categoría en uso no puede eliminarse.
 */
export class CategoriesRepository {
  /**
   * Convierte una fila cruda de la base de datos en una entidad {@link Category}.
   *
   * Se coerciona `id` y `fechaRegistro` porque el driver puede devolver tipos
   * distintos a los del dominio (p. ej. `id` como string/bigint o
   * `fechaRegistro` como `Date`). `nombre` se asigna tal cual, ya que la
   * columna es `NOT NULL` y de tipo texto.
   *
   * @param row - Fila tal como la devuelve Knex, con los alias camelCase aplicados.
   * @returns Entidad de dominio con tipos garantizados.
   */
  private mapRow(row: CategoryRow): Category {
    return {
      id: Number(row.id),
      nombre: row.nombre,
      fechaRegistro: String(row.fechaRegistro),
    };
  }

  /**
   * Lista todas las categorías ordenadas por nombre (ASC).
   *
   * No pagina ni filtra: devuelve la tabla completa. Es aceptable para un
   * catálogo pequeño; si crece, habría que paginar.
   *
   * @returns Lista de categorías; vacía si no hay registros.
   */
  async findAll(): Promise<Category[]> {
    const rows = (await db("categorias")
      .select("id", "nombre", { fechaRegistro: "fecharegistro" })
      .orderBy("nombre", "asc")) as CategoryRow[];

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Busca una categoría por su identificador primario.
   *
   * @param id - Identificador de la categoría (`categorias.id`).
   * @returns La categoría encontrada, o `null` si no existe.
   */
  async findById(id: number): Promise<Category | null> {
    const row = (await db("categorias")
      .select("id", "nombre", { fechaRegistro: "fecharegistro" })
      .where({ id })
      .first()) as CategoryRow | undefined;

    return row ? this.mapRow(row) : null;
  }

  /**
   * Busca una categoría por su nombre, ignorando mayúsculas y minúsculas.
   *
   * Compara con `LOWER(nombre) = LOWER(?)` para no depender del collation.
   * Contrapartida: al aplicar una función sobre la columna, el motor no usa el
   * índice `UNIQUE` de `nombre`; en un catálogo pequeño no importa.
   *
   * Pensado como verificación previa de duplicados antes de
   * {@link CategoriesRepository.create} o {@link CategoriesRepository.update}.
   * La garantía real de unicidad la da la restricción `UNIQUE`: entre esta
   * consulta y la escritura puede haber una condición de carrera, que se
   * manifestará como `ER_DUP_ENTRY`.
   *
   * No recorta espacios: el llamador debe normalizar `nombre` antes.
   *
   * @param nombre - Nombre de la categoría a buscar.
   * @returns La categoría encontrada, o `null` si no existe.
   */
  async findByName(nombre: string): Promise<Category | null> {
    const row = (await db("categorias")
      .select("id", "nombre", { fechaRegistro: "fecharegistro" })
      .whereRaw("LOWER(nombre) = LOWER(?)", [nombre])
      .first()) as CategoryRow | undefined;

    return row ? this.mapRow(row) : null;
  }

  /**
   * Inserta una nueva categoría y devuelve la entidad persistida.
   *
   * `fechaRegistro` no se envía: la genera la BD (`DEFAULT CURRENT_TIMESTAMP`).
   * Tras el insert se consulta por id para devolver la fila tal como quedó
   * guardada. Son dos consultas no atómicas salvo que se ejecuten dentro de
   * una transacción.
   *
   * Depende de que el driver devuelva el `insertId` como primer elemento
   * (comportamiento de MySQL/MariaDB; en PostgreSQL habría que usar `.returning()`).
   *
   * @param data - Datos de la categoría a crear.
   * @returns La categoría creada, con `id` y `fechaRegistro` asignados.
   * @throws {Error} Si la fila insertada no puede recuperarse inmediatamente después.
   * @throws Errores del driver (p. ej. `ER_DUP_ENTRY` por `nombre` duplicado)
   *   se propagan sin envolver.
   */
  async create(data: CreateCategoryData): Promise<Category> {
    const [id] = await db("categorias").insert({
      nombre: data.nombre,
    });

    const category = await this.findById(Number(id));

    if (!category) {
      throw new Error("No se pudo recuperar la categoría creada");
    }

    return category;
  }

  /**
   * Actualiza una categoría y devuelve su estado resultante.
   *
   * Pasa `data` completo al `UPDATE`, así que solo debe contener columnas
   * válidas de la tabla. Si `data` llega vacío, Knex lanza
   * "Empty .update() call detected"; el llamador debe garantizar al menos un
   * campo con valor.
   *
   * Devuelve `null` solo si la categoría no existe.
   *
   * @param id - Identificador de la categoría a actualizar.
   * @param data - Campos a modificar.
   * @returns La categoría actualizada, o `null` si no existe.
   * @throws Errores del driver (p. ej. `ER_DUP_ENTRY` si el nuevo `nombre`
   *   ya existe) se propagan sin envolver.
   */
  async update(id: number, data: UpdateCategoryData): Promise<Category | null> {
    await db("categorias").where({ id }).update(data);

    return this.findById(id);
  }
}

/** Instancia singleton del repositorio, compartida por toda la aplicación. */
export const categoriesRepository = new CategoriesRepository();
