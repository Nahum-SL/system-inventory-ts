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
    )
    .or(z.literal("")),
});

/**
 * Valida los campos enviados para actualizar una persona.
 * Todos son opcionales, pero se debe enviar al menos uno.
 */
export const updatePersonSchema = createPersonSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;