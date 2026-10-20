// Manejo de errores
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
// Repositorio
import { categoriesRepository } from "./categories.repository.js";
// Types
import type { Category } from "./categories.types.js";
// Schema
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./categories.schema.js";
import { isDuplicateEntryError } from "../../shared/utils/isDuplicateEntryError.js";

/**
 * Servicio de la lógica de negocio del módulo de categorías.
 *
 * Orquesta {@link CategoriesRepository} y traduce las condiciones de negocio
 * (categoría inexistente, nombre duplicado) a errores HTTP operacionales
 * ({@link NotFoundError}, {@link ConflictError}). No conoce Express: recibe
 * datos ya validados por el schema y los devuelve como entidades de dominio.
 */
export class CategoriesService {
  /**
   * Lista todas las categorías ordenadas por nombre (ASC).
   *
   * Delegación directa al repositorio: no filtra ni pagina.
   *
   * @returns Lista de categorías; vacía si no hay registros.
   */
  async list(): Promise<Category[]> {
    return categoriesRepository.findAll();
  }

  /**
   * Recupera una categoría por su identificador.
   *
   * También lo reutiliza {@link CategoriesService.update} para comprobar que
   * la categoría exista antes de modificarla.
   *
   * @param id - Identificador de la categoría.
   * @returns La categoría encontrada.
   * @throws {NotFoundError} Si no existe una categoría con ese id (404).
   */
  async getById(id: number): Promise<Category> {
    const category = await categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundError("La categoría no existe");
    }

    return category;
  }

  /**
   * Registra una nueva categoría verificando que su nombre no esté en uso.
   *
   * La búsqueda de duplicados ignora mayúsculas y minúsculas ("Equipos" y
   * "equipos" son el mismo nombre). El nombre se guarda con la capitalización
   * original que se envió.
   *
   * La verificación previa da un mensaje claro, pero no es atómica: ante dos
   * peticiones simultáneas con el mismo nombre, la segunda fallaría en el
   * insert con `ER_DUP_ENTRY` (restricción `UNIQUE`), que hoy llegaría al
   * error handler como un 500.
   *
   * @param input - Datos validados de la categoría a crear.
   * @returns La categoría creada, con `id` y `fechaRegistro` asignados.
   * @throws {ConflictError} Si ya existe una categoría con ese nombre (409).
   */
  async create(input: CreateCategoryInput): Promise<Category> {
    const nombre = input.nombre.trim();
    const existing = await categoriesRepository.findByName(nombre);

    if (existing) {
      throw new ConflictError("Ya existe una categoría con ese nombre");
    }

    try {
      return categoriesRepository.create({ nombre });
    } catch (error) {
      // Condición de carrera: otra petición insertó el mismo nombre
      // entre findByName y el insert.
      if (isDuplicateEntryError(error)) {
        throw new ConflictError("Ya existe una categoría con ese nombre");
      }

      throw error;
    }
  }

  /**
   * Actualiza una categoría existente y devuelve su estado resultante.
   *
   * Flujo:
   * 1. Comprueba que la categoría exista.
   * 2. Si no se envía `nombre` o es idéntico al actual, devuelve la categoría
   *    sin tocar la BD.
   * 3. Verifica que el nuevo nombre no pertenezca a otra categoría. Si el
   *    único coincidente es la propia categoría (cambio solo de
   *    capitalización, p. ej. "equipos" → "Equipos"), se permite.
   * 4. Actualiza y devuelve el registro.
   *
   * La verificación de duplicados no es atómica; ante una condición de
   * carrera, la restricción `UNIQUE` hará fallar el `UPDATE` con `ER_DUP_ENTRY`.
   *
   * @param id - Identificador de la categoría a actualizar.
   * @param input - Campos validados a modificar.
   * @returns La categoría actualizada (o la actual si no hubo cambios).
   * @throws {NotFoundError} Si la categoría no existe (404).
   * @throws {ConflictError} Si el nuevo nombre pertenece a otra categoría (409).
   */
  async update(id: number, input: UpdateCategoryInput): Promise<Category> {
    const current = await this.getById(id);
    const nombre = input.nombre?.trim();

    if (nombre === undefined || nombre === current.nombre) {
      return current;
    }

    const existing = await categoriesRepository.findByName(nombre);

    if (existing && existing.id !== id) {
      throw new ConflictError("Ya existe una categoría con ese nombre");
    }

    try {
      const updated = await categoriesRepository.update(id, { nombre });

      if (!updated) {
        throw new NotFoundError("La categoría no existe");
      }

      return updated;
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new ConflictError("Ya existe una categoría con ese nombre");
      }

      throw error;
    }
  }
}

/** Instancia singleton del servicio, compartida por toda la aplicación. */
export const categoriesService = new CategoriesService();
