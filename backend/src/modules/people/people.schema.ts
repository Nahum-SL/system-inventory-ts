import { z } from "zod";

/**
 * Normaliza los campos de contacto:
 * - undefined: campo no enviado.
 * - null: campo explícitamente vacío.
 * - "": se transforma en null.
 * - string: se valida y conserva.
 */
const optionalPhoneSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === ""
      ? null
      : typeof value === "string"
        ? value.trim()
        : value,
  z
    .string()
    .regex(/^\d{9}$/, {
      message: "El teléfono debe contener 9 dígitos",
    })
    .nullable()
    .optional(),
);

const optionalEmailSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === ""
      ? null
      : typeof value === "string"
        ? value.trim().toLowerCase()
        : value,
  z.email().max(150).nullable().optional(),
);

/**
 * Valida todos los campos para la creación de personas.
 */
export const createPersonSchema = z.object({
  apellidos: z.string().trim().min(1).max(100),
  nombres: z.string().trim().min(1).max(100),

  tipodoc: z.string().trim().min(1).max(20),

  numerodoc: z
    .string()
    .trim()
    .regex(/^\d{8}$/, {
      message: "El documento debe contener 8 dígitos",
    }),

  telefono: optionalPhoneSchema,
  email: optionalEmailSchema,
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
