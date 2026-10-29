import { z } from "zod";

/**
 * Valida los datos para crear un área en la tabla `areas`.
 *
 * - `nombre`: se recorta con `trim()` y debe tener entre 1 y 100 caracteres.
 *   La columna admite hasta 150, así que el límite de 100 es una decisión de
 *   negocio más estricta que la BD.
 * - Las claves no declaradas aquí se descartan al parsear.
 */
export const createAreaSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
});

/** Datos validados para crear un área. */
export type CreateAreaInput = z.infer<typeof createAreaSchema>;

/**
 * Valida los campos enviados para actualizar un área.
 *
 * Todos son opcionales, pero se debe enviar al menos uno. Un body vacío
 * (o con solo claves desconocidas) falla con el mensaje indicado.
 */
export const updateAreaSchema = createAreaSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
    path: ["body"],
  });

/** Datos validados para actualizar un área. */
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
