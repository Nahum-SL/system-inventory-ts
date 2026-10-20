import db from "../../database/knex.js";

//types
import type {
  CreatePersonData,
  Person,
  PersonFilters,
} from "./people.types.js";

/**
 * Repositorio de acceso a datos de la tabla `personas`.
 *
 * Encapsula las consultas SQL (vía Knex) y devuelve resultados normalizados
 * al modelo de dominio {@link Person}. No contiene reglas de negocio ni
 * validaciones de entrada: eso corresponde a la capa de servicio.
 *
 * Convenciones de la tabla (InnoDB):
 * - Las columnas están en minúsculas (`fecharegistro`); el dominio usa
 *   camelCase (`fechaRegistro`). La conversión se hace con alias en cada SELECT.
 * - `numerodoc` y `email` tienen restricción `UNIQUE`.
 * - `fecharegistro` es `NOT NULL` con default `CURRENT_TIMESTAMP`.
 */
export class PeopleRepository {
  /**
   * Convierte una fila cruda de la base de datos en una entidad {@link Person}.
   *
   * Se coerciona cada campo explícitamente porque el driver puede devolver
   * tipos distintos a los del dominio (p. ej. `id` como string/bigint o
   * `fechaRegistro` como `Date`).
   *
   * `telefono` y `email` se normalizan a `null` cuando llegan como
   * `null` o `undefined`.
   *
   * @param row - Fila tal como la devuelve Knex, con los alias camelCase aplicados.
   * @returns Entidad de dominio con tipos garantizados.
   */
  private mapRow(row: Record<string, unknown>): Person {
    return {
      id: Number(row.id),
      apellidos: String(row.apellidos),
      nombres: String(row.nombres),
      tipodoc: String(row.tipodoc),
      numerodoc: String(row.numerodoc),
      telefono: String(row.telefono),
      email: String(row.email),
      fechaRegistro: String(row.fechaRegistro),
    };
  }

  /**
   * Lista personas ordenadas por apellidos (ASC), con búsqueda opcional.
   *
   * Si se informa `filters.q`, se aplica `LIKE '%term%'` combinado con `OR`
   * sobre `nombres`, `apellidos`, `numerodoc` y `email`. El término se
   * recorta con `trim()` antes de usarse.
   *
   * Notas:
   * - La sensibilidad a mayúsculas depende del collation de la columna.
   * - Los comodines `%` y `_` incluidos en `q` no se escapan, por lo que el
   *   usuario puede alterar el patrón de búsqueda.
   * - No pagina: devuelve todas las coincidencias.
   * - El `LIKE` con comodín inicial no puede aprovechar índices.
   *
   * @param filters - Filtros opcionales. Sin filtros devuelve todas las personas.
   * @returns Lista de personas; vacía si no hay coincidencias.
   */
  async findAll(filters: PersonFilters = {}): Promise<Person[]> {
    const query = db("personas").select({
      id: "id",
      apellidos: "apellidos",
      nombres: "nombres",
      tipodoc: "tipodoc",
      numerodoc: "numerodoc",
      telefono: "telefono",
      email: "email",
      fechaRegistro: "fecharegistro",
    });

    if (filters.q) {
      const term = `%${filters.q.trim()}%`;

      query.where((builder) => {
        builder
          .where("nombres", "like", term)
          .orWhere("apellidos", "like", term)
          .orWhere("numerodoc", "like", term)
          .orWhere("email", "like", term);
      });
    }

    const rows = await query.orderBy("apellidos", "asc");

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Busca una persona por su identificador primario.
   *
   * @param id - Identificador de la persona (`personas.id`).
   * @returns La persona encontrada, o `null` si no existe.
   */
  async findById(id: number): Promise<Person | null> {
    const row = await db("personas")
      .select({
        id: "id",
        apellidos: "apellidos",
        nombres: "nombres",
        tipodoc: "tipodoc",
        numerodoc: "numerodoc",
        telefono: "telefono",
        email: "email",
        fechaRegistro: "fecharegistro",
      })
      .where({ id })
      .first();

    return row ? this.mapRow(row) : null;
  }

  /**
   * Indica si ya existe una persona con el número de documento dado.
   *
   * Coincidencia exacta sobre `numerodoc` (columna `UNIQUE`), consultando solo
   * `id` para evitar hidratar la entidad. No considera `tipodoc`: dos tipos de
   * documento con el mismo número se reportan como duplicado, igual que lo hace
   * la restricción de la BD.
   *
   * Es una verificación previa pensada para dar un mensaje de error claro antes
   * de {@link PeopleRepository.create}. La garantía real de unicidad la da la
   * restricción `UNIQUE`: entre esta consulta y el insert puede haber una
   * condición de carrera, que se manifestará como `ER_DUP_ENTRY`.
   *
   * @param numerodoc - Número de documento a verificar.
   * @returns `true` si existe al menos una persona con ese documento.
   */
  async documentExists(numerodoc: string): Promise<boolean> {
    const row = await db("personas").select("id").where({ numerodoc }).first();

    return Boolean(row);
  }

  /**
   * Indica si ya existe una persona con el email dado, ignorando mayúsculas.
   *
   * Compara con `LOWER(email) = LOWER(?)` para no depender del collation.
   * Contrapartida: al aplicar una función sobre la columna, el motor no usa el
   * índice `UNIQUE` de `email`. En tablas grandes conviene un collation `_ci`
   * (y comparar directamente) o un índice funcional.
   *
   * Igual que {@link PeopleRepository.documentExists}, es una verificación
   * previa; la unicidad definitiva la garantiza la restricción `UNIQUE`.
   *
   * @param email - Email a verificar. Se espera no vacío.
   * @returns `true` si existe al menos una persona con ese email.
   */
  async emailExists(email: string): Promise<boolean> {
    const row = await db("personas")
      .select("id")
      .whereRaw("LOWER(email) = LOWER(?)", [email])
      .first();

    return Boolean(row);
  }

  /**
   * Inserta una nueva persona y devuelve la entidad persistida.
   *
   * `fechaRegistro` no se envía: la genera la BD (`DEFAULT CURRENT_TIMESTAMP`).
   * Tras el insert se consulta por id para devolver la fila tal como quedó
   * guardada. Son dos consultas no atómicas salvo que se ejecuten dentro de
   * una transacción.
   *
   * Depende de que el driver devuelva el `insertId` como primer elemento
   * (comportamiento de MySQL/MariaDB; en PostgreSQL habría que usar `.returning()`).
   *
   * @param data - Datos de la persona a crear.
   * @returns La persona creada, con `id` y `fechaRegistro` asignados.
   * @throws {Error} Si la fila insertada no puede recuperarse inmediatamente después.
   * @throws Errores del driver (p. ej. `ER_DUP_ENTRY` por `numerodoc` o `email`
   *   duplicados, o `ER_BAD_NULL_ERROR`) se propagan sin envolver.
   */
  async create(data: CreatePersonData): Promise<Person> {
    const [insertedId] = await db("personas").insert({
      apellidos: data.apellidos,
      nombres: data.nombres,
      tipodoc: data.tipodoc,
      numerodoc: data.numerodoc,
      telefono: data.telefono || null,
      email: data.email || null,
    });

    const person = await this.findById(Number(insertedId));

    if (!person) {
      throw new Error("No se pudo recuperar la persona creada");
    }

    return person;
  }
}

/** Instancia singleton del repositorio, compartida por toda la aplicación. */
export const peopleRepository = new PeopleRepository();
