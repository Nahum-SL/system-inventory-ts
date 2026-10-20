import { z } from "zod";

/**
 * 
 */
export const createAreaSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
});

export type CreateAreaInput = z.infer<typeof createAreaSchema>;

export const updateAreaSchema = createAreaSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
