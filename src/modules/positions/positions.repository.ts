import db from "../../database/knex.js";
// Types - Interfaces
import type {
  Position,
  PositionRow,
  CreatePositionData,
  UpdatePositionData,
} from "./positions.types.js";

/**
 * Repositorio de acceso a datos de la tabla `cargos` (positions).
 *
 * Encapsula las consultas SQL (vía Knex) y devuelve resultados normalizados
 * al modelo de dominio {@link Position}, que incluye el nombre del área
 * (`areaNombre`) obtenido con un JOIN. No contiene reglas de negocio ni
 * validaciones de entrada: eso corresponde a la capa de servicio.
 *
 * Convenciones de la tabla (InnoDB):
 * - Las columnas están en snake_case (`area_id`); el dominio usa camelCase
 *   (`areaId`). La conversión se hace con alias en el SELECT de `baseQuery`.
 * - `area_id` es `NOT NULL` y tiene FK a `areas.id` (`ON DELETE RESTRICT`):
 *   no se puede crear un cargo en un área inexistente ni eliminar un área
 *   que tenga cargos.
 * - La unicidad es compuesta: `UNIQUE (area_id, nombre)`. El mismo nombre
 *   puede existir en áreas distintas, pero no dos veces en la misma.
 * - `asignaciones.cargo_id` referencia `cargos.id` con `ON DELETE RESTRICT`,
 *   por lo que un cargo en uso no puede eliminarse.
 * - La tabla no tiene `fecharegistro`.
 */
export class PositionsRepository {
  /**
   * Convierte una fila cruda de la base de datos en una entidad {@link Position}.
   *
   * Se coerciona `id` y `areaId` porque el driver puede devolver tipos
   * distintos a los del dominio. `areaNombre` y `nombre` se asignan tal cual,
   * ya que ambas columnas son `NOT NULL` y de tipo texto.
   *
   * @param row - Fila tal como la devuelve Knex, con los alias camelCase aplicados.
   * @returns Entidad de dominio con tipos garantizados.
   */
  private mapRow(row: PositionRow): Position {
    return {
      id: Number(row.id),
      areaId: Number(row.areaId),
      areaNombre: row.areaNombre,
      nombre: row.nombre,
    };
  }

  /**
   * Construye la consulta base compartida por todas las lecturas.
   *
   * Hace `JOIN` con `areas` (alias `a`) para traer el nombre del área y
   * aplica los alias camelCase (`areaId`, `areaNombre`). Como `area_id` es
   * `NOT NULL` con FK, el `INNER JOIN` nunca excluye filas válidas.
   *
   * Devuelve un query builder sin ejecutar: cada método le agrega sus
   * filtros y orden. Los filtros deben referirse a las tablas por su alias
   * (`c.` para cargos, `a.` para áreas).
   */
  private baseQuery() {
    return db("cargos as c")
      .join("areas as a", "a.id", "c.area_id")
      .select(
        "c.id",
        { areaId: "c.area_id" },
        { areaNombre: "a.nombre" },
        "c.nombre",
      );
  }

  /**
   * Lista todos los cargos ordenados por nombre de área y luego por nombre
   * de cargo (ASC).
   *
   * No pagina ni filtra: devuelve la tabla completa. Es aceptable para un
   * catálogo pequeño; si crece, habría que paginar.
   *
   * @returns Lista de cargos; vacía si no hay registros.
   */
  async findAll(): Promise<Position[]> {
    const rows = (await this.baseQuery()
      .orderBy("a.nombre", "asc")
      .orderBy("c.nombre", "asc")) as PositionRow[];

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Busca un cargo por su identificador primario.
   *
   * @param id - Identificador del cargo (`cargos.id`).
   * @returns El cargo encontrado (con el nombre de su área), o `null` si no existe.
   */
  async findById(id: number): Promise<Position | null> {
    const row = (await this.baseQuery().where("c.id", id).first()) as
      | PositionRow
      | undefined;

    return row ? this.mapRow(row) : null;
  }

  /**
   * Busca un cargo por nombre dentro de un área, ignorando mayúsculas y
   * minúsculas.
   *
   * Compara con `LOWER(c.nombre) = LOWER(?)` para no depender del collation.
   * Contrapartida: al aplicar una función sobre la columna, el motor no puede
   * usar por completo el índice `UNIQUE (area_id, nombre)`; en un catálogo
   * pequeño no importa.
   *
   * Pensado como verificación previa de duplicados antes de
   * {@link PositionsRepository.create} o {@link PositionsRepository.update}.
   * La garantía real de unicidad la da la restricción `UNIQUE`: entre esta
   * consulta y la escritura puede haber una condición de carrera, que se
   * manifestará como `ER_DUP_ENTRY`.
   *
   * No recorta espacios: el llamador debe normalizar `nombre` antes. Al
   * actualizar, el llamador debe comparar el `id` devuelto con el del cargo
   * que se edita, porque la búsqueda puede devolver el propio registro.
   *
   * @param nombre - Nombre del cargo a buscar.
   * @param areaId - Área en la que se busca.
   * @returns El cargo encontrado, o `null` si no existe.
   */
  async findByNameAndArea(
    nombre: string,
    areaId: number,
  ): Promise<Position | null> {
    const row = (await this.baseQuery()
      .whereRaw("LOWER(c.nombre) = LOWER(?)", [nombre])
      .andWhere("c.area_id", areaId)
      .first()) as PositionRow | undefined;

    return row ? this.mapRow(row) : null;
  }

  /**
   * Inserta un nuevo cargo y devuelve la entidad persistida.
   *
   * Tras el insert se consulta por id para devolver la fila con el JOIN
   * resuelto (`areaNombre`). Son dos consultas no atómicas salvo que se
   * ejecuten dentro de una transacción.
   *
   * Depende de que el driver devuelva el `insertId` como primer elemento
   * (comportamiento de MySQL/MariaDB; en PostgreSQL habría que usar `.returning()`).
   *
   * @param data - Datos del cargo a crear.
   * @returns El cargo creado, con su `id` asignado.
   * @throws {Error} Si la fila insertada no puede recuperarse inmediatamente después.
   * @throws Errores del driver se propagan sin envolver:
   *   - `ER_DUP_ENTRY`: ya existe ese `nombre` en esa área.
   *   - `ER_NO_REFERENCED_ROW_2`: el `areaId` no existe.
   */
  async create(data: CreatePositionData): Promise<Position> {
    const [id] = await db("cargos").insert({
      area_id: data.areaId,
      nombre: data.nombre,
    });

    const position = await this.findById(Number(id));

    if (!position) {
      throw new Error("No se pudo recuperar el cargo creado");
    }

    return position;
  }

  /**
   * Actualiza un cargo y devuelve su estado resultante.
   *
   * Solo se envían al `UPDATE` los campos definidos en `data`, traducidos a
   * sus columnas (`areaId` → `area_id`); así no se escribe nada no permitido.
   * Si `data` no contiene campos, no se ejecuta el `UPDATE` y se devuelve el
   * cargo actual.
   *
   * Devuelve `null` solo si el cargo no existe.
   *
   * @param id - Identificador del cargo a actualizar.
   * @param data - Campos a modificar.
   * @returns El cargo actualizado, o `null` si no existe.
   * @throws Errores del driver se propagan sin envolver:
   *   - `ER_DUP_ENTRY`: el resultado (`area_id`, `nombre`) ya existe.
   *   - `ER_NO_REFERENCED_ROW_2`: el nuevo `areaId` no existe.
   */
  async update(id: number, data: UpdatePositionData): Promise<Position | null> {
    const updateData: Record<string, unknown> = {};

    if (data.areaId !== undefined) {
      updateData.area_id = data.areaId;
    }

    if (data.nombre !== undefined) {
      updateData.nombre = data.nombre;
    }

    if (Object.keys(updateData).length > 0) {
      await db("cargos").where({ id }).update(updateData);
    }

    return this.findById(id);
  }
}

/** Instancia singleton del repositorio, compartida por toda la aplicación. */
export const positionsRepository = new PositionsRepository();
