// shared/utils/withConflictHandling.ts
import { ConflictError } from "../errors/AppError.js";
import { isDuplicateEntryError } from "./isDuplicateEntryError.js";

/**
 * Ejecuta una operación de escritura y traduce una violación de `UNIQUE`
 * (`ER_DUP_ENTRY`) a un {@link ConflictError} (409).
 *
 * Cubre la condición de carrera: dos peticiones simultáneas pueden pasar la
 * verificación previa de duplicados, y la segunda falla en la BD. Cualquier
 * otro error se relanza sin modificar.
 *
 * Solo debe envolver la llamada al repositorio, no las validaciones previas,
 * para no mezclar errores de negocio con errores del driver.
 *
 * Útil cuando la tabla tiene una sola restricción `UNIQUE`. Si hay varias
 * (p. ej. `personas`: documento y email), usa un `try/catch` explícito para
 * distinguir cuál falló.
 *
 * @param operation - Función que ejecuta la escritura en el repositorio.
 * @param message - Mensaje del `ConflictError` si hay duplicado.
 * @returns El resultado de la operación.
 * @throws {ConflictError} Si la BD reporta una entrada duplicada (409).
 */
export async function withConflictHandling<T>(
  operation: () => Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      throw new ConflictError(message);
    }

    throw error;
  }
}
