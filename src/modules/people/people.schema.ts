import { z } from "zod";

/**
 * Valida todos los campos para la creacion de nuevos registros
 * en la tabla Personas
 */
export const createPersonSchema = z.object({
  apellidos: z.string().trim().min(1).max(100),
  nombres: z.string().trim().min(1).max(100),

  tipodoc: z.string().trim().min(1).max(20),

  // La columna numerodoc de la base de datos admite 8 caracteres.
  numerodoc: z
    .string()
    .trim()
    .regex(/^\d{8}$/, {
      message: "El documento debe contener 8 dígitos",
    }),

  telefono: z
    .string()
    .trim()
    .regex(/^\d{9}$/, {
      message: "El teléfono debe contener 9 dígitos",
    }),

  email: z
    .preprocess(
      (val) => (typeof val === "string" ? val.trim() : val),
      z.email().max(150),
    ).or(z.literal("")),

});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
