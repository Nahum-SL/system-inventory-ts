import { z } from "zod";

/**
 * Valida los datos para crear un cargo en la tabla `cargos`.
 *
 * - `areaId`: entero positivo que identifica el área. Debe llegar como
 *   número (no como string). Que el área exista lo verifica el servicio.
 * - `nombre`: se recorta con `trim()` y debe tener entre 1 y 100 caracteres
 *   (la columna admite hasta 150). Es único dentro de cada área.
 */
export const createPositionSchema = z.object({
  areaId: z
    .number({ error: "El área es obligatoria y debe ser un número" })
    .int("El área debe ser un número entero")
    .positive("El área no es válida"),
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre del cargo es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),
});

/**
 * Valida los campos enviados para actualizar un cargo.
 * Todos son opcionales, pero se debe enviar al menos uno.
 */
export const updatePositionSchema = createPositionSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
    path: ["body"],
  });

/** Datos validados para crear un cargo. */
export type CreatePositionInput = z.infer<typeof createPositionSchema>;
/** Datos validados para actualizar un cargo. */
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
