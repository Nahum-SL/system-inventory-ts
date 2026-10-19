import { z } from "zod";

/**
 * Validacion de que todos los campos cumplan las restricciones
 */
export const createMaintenanceSchema = z.object({
  tipo: z.enum(["preventivo", "correctivo"]),

  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),

  descripcion: z.string().trim().min(1).max(2000),

  observaciones: z.string().trim().max(2000).optional(),

  costo: z.number().min(0).max(99999999.99).default(0),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
