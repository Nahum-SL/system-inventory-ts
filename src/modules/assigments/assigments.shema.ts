import { z } from "zod";

/**
 * Valida y restringe que todos los campos se cumplan para Asignaciones 
 */
export const createAssignmentSchema = z.object({
  personaId: z.number().int().positive(),

  cargoId: z.number().int().positive(),

  fechaInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),

  condicionEntrega: z.string().trim().min(1).max(1000),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const returnAssignmentSchema = z.object({
  condicionDevolucion: z.string().trim().min(1).max(1000),
});

export type ReturnAssignmentInput = z.infer<typeof returnAssignmentSchema>;
