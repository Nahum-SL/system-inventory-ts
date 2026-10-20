// Traducir ER_DUP_ENTRY a ConflictError. 
// Hoy la condición de carrera termina en un 500 en los modulos. 
// Un helper compartido lo resuelve en un solo sitio:

/**
 * Se usa en el catch del create/update de cada servicio para relanzar un ConflictError
 * @param error 
 * @returns 
 */
export function isDuplicateEntryError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  );
}
