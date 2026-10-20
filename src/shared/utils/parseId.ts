// shared/utils/parseId.ts
import { BadRequestError } from "../errors/AppError.js";

/**
 * Convierte un parámetro de ruta en un id numérico válido.
 *
 * Acepta `unknown` porque `req.params` puede tipar sus valores como
 * `string | string[]`. Cualquier valor que no sea un entero positivo
 * seguro (incluidos arrays, `undefined` y texto) se rechaza.
 *
 * @param value - Valor crudo del parámetro de ruta.
 * @param entidad - Texto para el mensaje de error (p. ej. "del área").
 * @returns El id como número entero positivo.
 * @throws {BadRequestError} Si el valor no es un id válido (400).
 */
export function parseId(value: unknown, entidad: string): number {
  const id = typeof value === "string" ? Number(value) : NaN;

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new BadRequestError(`El ID ${entidad} no es válido`);
  }

  return id;
}
