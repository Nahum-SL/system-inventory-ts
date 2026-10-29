import db from "../../database/knex.js";
// Types - Interfaces
import type {
  Area,
  AreaRow,
  CreateAreaData,
  UpdateAreaData,
} from "./areas.types.js";

/**
 * Repositorio de acceso a datos de la tabla `areas`.
 *
 * Encapsula las consultas SQL (vía Knex) y devuelve resultados normalizados
 * al modelo de dominio {@link Area}. No contiene reglas de negocio ni
 * validaciones de entrada: eso corresponde a la capa de servicio.
 *
 * Convenciones de la tabla (InnoDB):
 * - La columna `fecharegistro` está en minúsculas; el dominio usa camelCase
 *   (`fechaRegistro`). La conversión se hace con alias en cada SELECT.
 * - `nombre` es `NOT NULL` y tiene restricción `UNIQUE`.
 * - `fecharegistro` es `NOT NULL` con default `CURRENT_TIMESTAMP`.
 * - Otras tablas (`cargos`, `activos`, `movimientos`) referencian `areas.id`
 *   con `ON DELETE RESTRICT`, por lo que un área en uso no puede eliminarse.
 */
export class AreasRepository {
  /**
   * Convierte una fila cruda de la base de datos en una entidad {@link Area}.
   *
   * Se coerciona `id` y `fechaRegistro` porque el driver puede devolver tipos
   * distintos a los del dominio (p. ej. `id` como string/bigint o
   * `fechaRegistro` como `Date`). `nombre` se asigna tal cual, ya que la
   * columna es `NOT NULL` y de tipo texto.
   *
   * @param row - Fila tal como la devuelve Knex, con los alias camelCase aplicados.
   * @returns Entidad de dominio con tipos garantizados.
   */
  private mapRow(row: AreaRow): Area {
    return {
      id: Number(row.id),
      nombre: row.nombre,
      fechaRegistro: String(row.fechaRegistro),
    };
  }

  /**
   * Lista todas las áreas ordenadas por nombre (ASC).
   *
   * No pagina ni filtra: devuelve la tabla completa. Es aceptable para un
   * catálogo pequeño; si crece, habría que paginar.
   *
   * @returns Lista de áreas; vacía si no hay registros.
   */
  async findAll(): Promise<Area[]> {
    const rows = (await db("areas")
      .select("id", "nombre", { fechaRegistro: "fecharegistro" })
      .orderBy("nombre", "asc")) as AreaRow[];

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Busca un área por su identificador primario.
   *
   * @param id - Identificador del área (`areas.id`).
   * @returns El área encontrada, o `null` si no existe.
   */
  async findById(id: number): Promise<Area | null> {
    const row = (await db("areas")
      .select("id", "nombre", { fechaRegistro: "fecharegistro" })
      .where({ id })
      .first()) as AreaRow | undefined;

    return row ? this.mapRow(row) : null;
  }

  /**
   * Busca un área por su nombre, ignorando mayúsculas y minúsculas.
   *
   * Compara con `LOWER(nombre) = LOWER(?)` para no depender del collation.
   * Contrapartida: al aplicar una función sobre la columna, el motor no usa el
   * índice `UNIQUE` de `nombre`; en un catálogo pequeño no importa, pero en
   * tablas grandes conviene un collation `_ci` y comparar directamente.
   *
   * Pensado como verificación previa de duplicados antes de
   * {@link AreasRepository.create} o {@link AreasRepository.update}. La garantía
   * real de unicidad la da la restricción `UNIQUE`: entre esta consulta y la
   * escritura puede haber una condición de carrera, que se manifestará como
   * `ER_DUP_ENTRY`.
   *
   * No recorta espacios: el llamador debe normalizar `nombre` antes.
   *
   * @param nombre - Nombre del área a buscar.
   * @returns El área encontrada, o `null` si no existe.
   */
  async findByName(nombre: string): Promise<Area | null> {
    const row = (await db("areas")
      .select("id", "nombre", { fechaRegistro: "fecharegistro" })
      .whereRaw("LOWER(nombre) = LOWER(?)", [nombre])
      .first()) as AreaRow | undefined;

    return row ? this.mapRow(row) : null;
  }

  /**
   * Inserta una nueva área y devuelve la entidad persistida.
   *
   * `fechaRegistro` no se envía: la genera la BD (`DEFAULT CURRENT_TIMESTAMP`).
   * Tras el insert se consulta por id para devolver la fila tal como quedó
   * guardada. Son dos consultas no atómicas salvo que se ejecuten dentro de
   * una transacción.
   *
   * Depende de que el driver devuelva el `insertId` como primer elemento
   * (comportamiento de MySQL/MariaDB; en PostgreSQL habría que usar `.returning()`).
   *
   * @param data - Datos del área a crear.
   * @returns El área creada, con `id` y `fechaRegistro` asignados.
   * @throws {Error} Si la fila insertada no puede recuperarse inmediatamente después.
   * @throws Errores del driver (p. ej. `ER_DUP_ENTRY` por `nombre` duplicado)
   *   se propagan sin envolver.
   */
  async create(data: CreateAreaData): Promise<Area> {
    const [id] = await db("areas").insert({
      nombre: data.nombre,
    });

    const area = await this.findById(Number(id));

    if (!area) {
      throw new Error("No se pudo recuperar el área creada");
    }

    return area;
  }

  /**
   * Actualiza un área y devuelve su estado resultante.
   *
   * Pasa `data` completo al `UPDATE`, así que solo debe contener columnas
   * válidas de la tabla. Si `data` llega vacío, Knex lanza un error al
   * construir la consulta; el llamador debe garantizar al menos un campo
   * (el schema de validación ya lo exige).
   *
   * No distingue "no existe" de "no hubo cambios": ambos casos ejecutan el
   * UPDATE sin error y luego se consulta por id. Devuelve `null` solo si el
   * área no existe.
   *
   * @param id - Identificador del área a actualizar.
   * @param data - Campos a modificar.
   * @returns El área actualizada, o `null` si no existe.
   * @throws Errores del driver (p. ej. `ER_DUP_ENTRY` si el nuevo `nombre`
   *   ya existe) se propagan sin envolver.
   */
  async update(id: number, data: UpdateAreaData): Promise<Area | null> {
    await db("areas").where({ id }).update(data);

    return this.findById(id);
  }
}

/** Instancia singleton del repositorio, compartida por toda la aplicación. */
export const areasRepository = new AreasRepository();
