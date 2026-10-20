import { z } from "zod";

/**
 * Valida los datos para crear una categoría en la tabla `cargos`.
 *
 * - `areaId`: se recorta con `trim()` y validando que sea mayor que 0 con`int().positive` 
 * - `nombre`: se recorta con `trim()` y debe tener entre 1 y 100 caracteres
 *   (la columna admite hasta 150).
 */
export const createPositionSchema = z.object({
  areaId: z.number().int().positive(),
  nombre: z.string().trim().min(1).max(100),
});

/**
 * Valida los campos enviados para actualizar un cargo.
 */
export const updatePositionSchema = createPositionSchema
.partial()
.refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
});

/** Datos validados para crear un position/cargo. */
export type CreatePositionInput = z.infer<typeof createPositionSchema>;
/** Datos validados actualizar un position/cargo. */
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
