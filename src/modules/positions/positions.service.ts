// Manejo de errores
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
// Utils
import { withConflictHandling } from "../../shared/utils/withConflictHandling.js";
// ================
// REPOSITORIOS
// *************
// Areas
import { areasRepository } from "../areas/areas.repository.js";
// Positions / Cargos
import { positionsRepository } from "./positions.repository.js";
// *************
// ================
// Type
import type { Position } from "./positions.types.js";
// SCHEMA
import type {
  CreatePositionInput,
  UpdatePositionInput,
} from "./positions.schema.js";

const DUPLICATE_MESSAGE =
  "Ya existe un cargo con ese nombre en el área indicada";

/**
 * Servicio de la lógica de negocio del módulo de cargos (positions).
 *
 * Orquesta {@link PositionsRepository} y {@link AreasRepository} y traduce las
 * condiciones de negocio (cargo o área inexistente, nombre duplicado en el
 * área) a errores HTTP operacionales ({@link NotFoundError},
 * {@link ConflictError}). No conoce Express: recibe datos ya validados por el
 * schema y los devuelve como entidades de dominio.
 *
 * Regla de unicidad: el nombre es único dentro de cada área, no globalmente
 * (`UNIQUE (area_id, nombre)`).
 */
export class PositionsService {
  /**
   * Lista todos los cargos ordenados por nombre de área y luego por nombre.
   *
   * Delegación directa al repositorio: no filtra ni pagina.
   *
   * @returns Lista de cargos; vacía si no hay registros.
   */
  async list(): Promise<Position[]> {
    return positionsRepository.findAll();
  }

  /**
   * Recupera un cargo por su identificador, incluyendo el nombre de su área.
   *
   * También lo reutiliza {@link PositionsService.update} para comprobar que
   * el cargo exista antes de modificarlo.
   *
   * @param id - Identificador del cargo.
   * @returns El cargo encontrado.
   * @throws {NotFoundError} Si no existe un cargo con ese id (404).
   */
  async getById(id: number): Promise<Position> {
    const position = await positionsRepository.findById(id);

    if (!position) {
      throw new NotFoundError("El cargo no existe");
    }

    return position;
  }

  /**
   * Registra un nuevo cargo dentro de un área.
   *
   * Flujo:
   * 1. Verifica que el área indicada exista.
   * 2. Verifica que no haya otro cargo con el mismo nombre en esa área
   *    (sin distinguir mayúsculas). El mismo nombre sí puede existir en
   *    áreas distintas.
   * 3. Inserta el cargo.
   *
   * Las verificaciones previas dan mensajes claros, pero no son atómicas. Si
   * dos peticiones simultáneas pasan el paso 2, la restricción `UNIQUE` hace
   * fallar el insert y el error se traduce a {@link ConflictError}.
   *
   * @param input - Datos validados del cargo a crear.
   * @returns El cargo creado, con su `id` asignado.
   * @throws {NotFoundError} Si el área no existe (404).
   * @throws {ConflictError} Si ya existe un cargo con ese nombre en el área (409).
   */
  async create(input: CreatePositionInput): Promise<Position> {
    const nombre = input.nombre.trim();

    const area = await areasRepository.findById(input.areaId);

    if (!area) {
      throw new NotFoundError("El área indicada no existe");
    }

    const existing = await positionsRepository.findByNameAndArea(
      nombre,
      input.areaId,
    );

    if (existing) {
      throw new ConflictError(DUPLICATE_MESSAGE);
    }

    return withConflictHandling(
      () => positionsRepository.create({ areaId: input.areaId, nombre }),
      DUPLICATE_MESSAGE,
    );
  }

  /**
   * Actualiza un cargo existente y devuelve su estado resultante.
   *
   * Como la unicidad es compuesta (`area_id`, `nombre`), la validación se hace
   * sobre el resultado final: los valores enviados se combinan con los
   * actuales. Así, mover un cargo a otra área donde ya existe ese nombre se
   * detecta aunque solo se haya enviado `areaId`.
   *
   * Flujo:
   * 1. Comprueba que el cargo exista.
   * 2. Si ningún valor cambia, devuelve el cargo sin tocar la BD.
   * 3. Si cambia el área, verifica que la nueva exista. El área actual no se
   *    revisa porque la FK garantiza que existe.
   * 4. Verifica que (`areaId`, `nombre`) finales no pertenezcan a otro cargo.
   *    Si el único coincidente es el propio cargo (cambio solo de
   *    capitalización), se permite.
   * 5. Actualiza solo los campos que cambian.
   *
   * La verificación de duplicados no es atómica; ante una condición de
   * carrera, la restricción `UNIQUE` se traduce a {@link ConflictError}.
   *
   * @param id - Identificador del cargo a actualizar.
   * @param input - Campos validados a modificar.
   * @returns El cargo actualizado (o el actual si no hubo cambios).
   * @throws {NotFoundError} Si el cargo o el nuevo área no existen (404).
   * @throws {ConflictError} Si el resultado duplica otro cargo del área (409).
   */
  async update(id: number, input: UpdatePositionInput): Promise<Position> {
    const current = await this.getById(id);

    const areaId = input.areaId ?? current.areaId;
    const nombre = input.nombre?.trim() ?? current.nombre;

    if (areaId === current.areaId && nombre === current.nombre) {
      return current;
    }

    if (areaId !== current.areaId) {
      const area = await areasRepository.findById(areaId);

      if (!area) {
        throw new NotFoundError("El área indicada no existe");
      }
    }

    const existing = await positionsRepository.findByNameAndArea(
      nombre,
      areaId,
    );

    if (existing && existing.id !== id) {
      throw new ConflictError(DUPLICATE_MESSAGE);
    }

    const updated = await withConflictHandling(
      () =>
        positionsRepository.update(id, {
          ...(areaId !== current.areaId ? { areaId } : {}),
          ...(nombre !== current.nombre ? { nombre } : {}),
        }),
      DUPLICATE_MESSAGE,
    );

    if (!updated) {
      throw new NotFoundError("El cargo no existe");
    }

    return updated;
  }
}

/** Instancia singleton del servicio, compartida por toda la aplicación. */
export const positionsService = new PositionsService();
