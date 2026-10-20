import { z } from "zod";

/**
 * Valida los datos para crear un área en la tabla `categorias`.
 */
export const createCategorySchema = z.object({
  nombre: z.string().trim().min(1).max(100),
});

/**
 * Valida los campos enviados para actualizar una categoria.
 */
export const updateCategorySchema = createCategorySchema
.partial()
.refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
});

/** Datos validados para crear una categoria. */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
/** Datos validados para actualizar una categoria. */
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
