import { z } from "zod";

/** Datos para crear una cuenta. Solo un administrador puede hacerlo. */
export const createUserSchema = z.object({
  personaId: z
    .number({ error: "La persona es obligatoria y debe ser un número" })
    .int("La persona debe ser un entero")
    .positive("La persona no es válida"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(150, "El usuario no puede superar los 150 caracteres")
    .regex(
      /^[a-z0-9._-]+$/,
      "El usuario solo puede tener letras, números, punto, guion y guion bajo",
    ),
  password: z
    .string()
    .min(12, "La contraseña debe tener al menos 12 caracteres")
    .refine((v) => Buffer.byteLength(v, "utf8") <= 72, {
      message: "La contraseña no puede superar los 72 bytes",
    }),
  rol: z.enum(["admin", "usuario"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;