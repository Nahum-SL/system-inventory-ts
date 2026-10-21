import { z } from "zod";

const idField = (nombre: string) =>
  z
    .number({ error: `${nombre} es obligatorio y debe ser un número` })
    .int(`${nombre} debe ser un entero`)
    .positive(`${nombre} no es válido`);

/** Datos para asignar un activo. Las condiciones admiten 250 caracteres (límite de la columna). */
export const createAssignmentSchema = z.object({
  personaId: idField("La persona"),
  cargoId: idField("El cargo"),
  fechaInicio: z.iso.date("La fecha debe tener formato YYYY-MM-DD"),
  condicionEntrega: z
    .string()
    .trim()
    .min(1, "La condición de entrega es obligatoria")
    .max(250, "La condición no puede superar los 250 caracteres"),
});

/** Datos para registrar la devolución. `fechaFin` no puede ser anterior al inicio. */
export const returnAssignmentSchema = z.object({
  fechaFin: z.iso.date("La fecha debe tener formato YYYY-MM-DD"),
  condicionDevolucion: z
    .string()
    .trim()
    .min(1, "La condición de devolución es obligatoria")
    .max(250, "La condición no puede superar los 250 caracteres"),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type ReturnAssignmentInput = z.infer<typeof returnAssignmentSchema>;
