import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
import { areasRepository } from "./areas.repository.js";
import type { Area } from "./areas.types.js";
import type { CreateAreaInput, UpdateAreaInput } from "./areas.schema.js";

/**
 * Servicio de la lógica de negocio del módulo de áreas.
 *
 * Orquesta {@link AreasRepository} y traduce las condiciones de negocio
 * (área inexistente, nombre duplicado) a errores HTTP operacionales
 * ({@link NotFoundError}, {@link ConflictError}). No conoce Express: recibe
 * datos ya validados por el schema y los devuelve como entidades de dominio.
 */
export class AreasService {
  /**
   * Lista todas las áreas ordenadas por nombre (ASC).
   *
   * Delegación directa al repositorio: no filtra ni pagina.
   *
   * @returns Lista de áreas; vacía si no hay registros.
   */
  async list(): Promise<Area[]> {
    return areasRepository.findAll();
  }

  /**
   * Recupera un área por su identificador.
   *
   * También lo reutiliza {@link AreasService.update} para comprobar que el
   * área exista antes de modificarla.
   *
   * @param id - Identificador del área.
   * @returns El área encontrada.
   * @throws {NotFoundError} Si no existe un área con ese id (404).
   */
  async getById(id: number): Promise<Area> {
    const area = await areasRepository.findById(id);

    if (!area) {
      throw new NotFoundError("El área no existe");
    }

    return area;
  }

  /**
   * Registra una nueva área verificando que su nombre no esté en uso.
   *
   * El nombre se recorta con `trim()` y la búsqueda de duplicados ignora
   * mayúsculas y minúsculas ("Sistemas" y "sistemas" son el mismo nombre).
   * El nombre se guarda con la capitalización original que se envió.
   *
   * La verificación previa da un mensaje claro, pero no es atómica: dos
   * peticiones simultáneas con el mismo nombre pueden pasarla y la segunda
   * fallaría en el insert con `ER_DUP_ENTRY` (restricción `UNIQUE`), que hoy
   * llegaría al error handler como un 500.
   *
   * @param input - Datos validados del área a crear.
   * @returns El área creada, con `id` y `fechaRegistro` asignados.
   * @throws {ConflictError} Si ya existe un área con ese nombre (409).
   */
  async create(input: CreateAreaInput): Promise<Area> {
    const nombre = input.nombre.trim();

    const existing = await areasRepository.findByName(nombre);

    if (existing) {
      throw new ConflictError("Ya existe un área con ese nombre");
    }

    return areasRepository.create({ nombre });
  }

  /**
   * Actualiza un área existente y devuelve su estado resultante.
   *
   * Flujo:
   * 1. Comprueba que el área exista.
   * 2. Si se envía `nombre`, lo recorta y verifica que no pertenezca a otra
   *    área. Si el único coincidente es la propia área, se permite, lo que
   *    habilita cambiar solo la capitalización ("sistemas" → "Sistemas").
   * 3. Envía al repositorio únicamente los campos que realmente cambian.
   *
   * Si ningún campo cambia (p. ej. se envía el mismo `nombre`), el repositorio
   * recibe un objeto vacío y Knex lanza un error en el `UPDATE`.
   *
   * La verificación de duplicados no es atómica; ante una condición de
   * carrera, la restricción `UNIQUE` hará fallar el `UPDATE` con `ER_DUP_ENTRY`.
   *
   * @param id - Identificador del área a actualizar.
   * @param input - Campos validados a modificar.
   * @returns El área actualizada.
   * @throws {NotFoundError} Si el área no existe (404).
   * @throws {ConflictError} Si el nuevo nombre pertenece a otra área (409).
   */
  async update(id: number, input: UpdateAreaInput): Promise<Area> {
    const current = await this.getById(id);
    const nombre = input.nombre?.trim();

    if (nombre === undefined || nombre === current.nombre) {
      return current;
    }

    const existing = await areasRepository.findByName(nombre);

    if (existing && existing.id !== id) {
      throw new ConflictError("Ya existe un área con ese nombre");
    }

    const updated = await areasRepository.update(id, { nombre });

    if (!updated) {
      throw new NotFoundError("El área no existe");
    }

    return updated;
  }
}

/** Instancia singleton del servicio, compartida por toda la aplicación. */
export const areasService = new AreasService();
