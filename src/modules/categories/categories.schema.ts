import { z } from "zod";

/**
 * Valida los datos para crear una categoría en la tabla `categorias`.
 *
 * - `nombre`: se recorta con `trim()` y debe tener entre 1 y 100 caracteres
 *   (la columna admite hasta 150).
 */
export const createCategorySchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre de la categoría es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),
});

/**
 * Valida los campos enviados para actualizar una categoría.
 * Todos son opcionales, pero se debe enviar al menos uno.
 */
export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
    path: ["body"],
  });

/** Datos validados para crear una categoría. */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
/** Datos validados para actualizar una categoría. */
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;