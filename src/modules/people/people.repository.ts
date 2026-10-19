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
 * Encapsula todas las consultas SQL (vía Knex) y expone resultados ya
 * normalizados al modelo de dominio {@link Person}. No contiene reglas de
 * negocio ni validaciones: eso corresponde a la capa de servicio.
 *
 * Convenciones de la tabla:
 * - Las columnas están en minúsculas (`fecharegistro`); el dominio usa
 *   camelCase (`fechaRegistro`). La conversión se hace en cada SELECT mediante alias.
 * - `telefono` y `email` son opcionales y se persisten como `NULL` cuando no hay valor.
 */
export class PeopleRepository {
  /**
   * Convierte una fila cruda de la base de datos en una entidad {@link Person}.
   *
   * Existe porque el driver puede devolver tipos distintos a los del dominio
   * (por ejemplo `id` como `bigint`/string o fechas como `Date`), por lo que se
   * coerciona explícitamente cada campo.
   *
   * Los campos opcionales (`telefono`, `email`) se normalizan a `null`
   * cuando llegan como `null` o `undefined`.
   *
   * @param row - Fila tal como la devuelve Knex, ya con los alias camelCase aplicados.
   * @returns Entidad de dominio con tipos garantizados.
   * @param row
   * @returns
   */
  private mapRow(row: Record<string, unknown>): Person {
    return {
      id: Number(row.id),
      apellidos: String(row.apellidos),
      nombres: String(row.nombres),
      tipodoc: String(row.tipodoc),
      numerodoc: String(row.numerodoc),
      telefono: row.telefono == null ? null : String(row.telefono),
      email: row.email == null ? null : String(row.email),
      fechaRegistro: String(row.fechaRegistro),
    };
  }

  /**
   * Lista personas, con búsqueda opcional, ordenadas por apellidos (ASC).
   *
   * Cuando se informa `filters.q`, se aplica un `LIKE '%term%'` combinado con
   * `OR` sobre `nombres`, `apellidos`, `numerodoc` y `email`. El término se
   * recorta con `trim()` antes de usarse.
   *
   * Notas:
   * - La sensibilidad a mayúsculas depende del collation de la columna.
   * - Los comodines `%` y `_` incluidos en `q` no se escapan, por lo que el
   *   usuario puede alterar el patrón de búsqueda.
   * - No pagina: devuelve todas las coincidencias.
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
   * Indica si ya existe una persona registrada con el número de documento dado.
   *
   * Usa coincidencia exacta sobre `numerodoc` y solo consulta `id`
   * (no hidrata la entidad), por lo que es una verificación barata.
   * No considera `tipodoc`: dos tipos de documento distintos con el mismo
   * número se reportarán como duplicado.
   *
   * Pensado para validar unicidad antes de {@link PeopleRepository.create}.
   * No sustituye una restricción `UNIQUE` en base de datos: entre la
   * verificación y el insert puede haber una condición de carrera.
   *
   * @param numerodoc - Número de documento a verificar.
   * @returns `true` si existe al menos una persona con ese documento.
   */
  async documentExists(numerodoc: string): Promise<boolean> {
    const row = await db("personas").select("id").where({ numerodoc }).first();

    return Boolean(row);
  }

  /**
   * Indica si ya existe una persona registrada con el email dado,
   * ignorando mayúsculas y minúsculas.
   *
   * La comparación se hace con `LOWER(email) = LOWER(?)` para garantizar
   * resultados consistentes sin depender del collation. Como contrapartida,
   * al aplicar una función sobre la columna el motor no puede usar un índice
   * normal sobre `email`; con tablas grandes conviene un índice funcional o un
   * collation `_ci`.
   *
   * Al igual que {@link PeopleRepository.documentExists}, es una verificación previa
   * y no reemplaza una restricción `UNIQUE`.
   *
   * @param email - Email a verificar. Se espera no vacío (los vacíos se guardan como `NULL`).
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
   * `telefono` y `email` se normalizan a `NULL` cuando llegan vacíos
   * (`""`, `undefined`), evitando almacenar strings vacíos.
   * `fechaRegistro` no se envía: se asume que la genera la base de datos
   * (default/`CURRENT_TIMESTAMP`).
   *
   * Tras el insert se vuelve a consultar por id para devolver la fila tal
   * como quedó en la tabla (incluida la fecha generada por la BD).
   * Esto implica dos consultas y que el insert y el select no son atómicos
   * salvo que se ejecute dentro de una transacción.
   *
   * Depende de que el driver devuelva el `insertId` como primer elemento
   * (comportamiento de MySQL/MariaDB; en PostgreSQL habría que usar `.returning()`).
   *
   * @param data - Datos de la persona a crear.
   * @returns La persona creada, con su `id` y `fechaRegistro` asignados.
   * @throws {Error} Si la fila insertada no puede recuperarse inmediatamente después.
   * @throws Errores del driver (p. ej. violación de `UNIQUE`/`NOT NULL`) se propagan sin envolver.
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
