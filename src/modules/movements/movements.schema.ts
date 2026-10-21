import { z } from "zod";

/** Datos para trasladar un activo. El motivo admite 250 caracteres (límite de la columna). */
export const createMovementSchema = z.object({
  areaDestinoId: z
    .number({ error: "El área de destino es obligatoria y debe ser un número" })
    .int("El área de destino debe ser un entero")
    .positive("El área de destino no es válida"),
  motivo: z
    .string()
    .trim()
    .max(250, "El motivo no puede superar los 250 caracteres")
    .optional(),
});

export type CreateMovementInput = z.infer<typeof createMovementSchema>;
