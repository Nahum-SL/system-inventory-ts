import { z } from "zod";

/**
 * Validacion para crear cuentas, solo un administrado podra crear usuarios
 */
export const createUserSchema = z.object({
  personaId: z
    .number()
    .int("El ID de la persona debe ser un entero")
    .positive("El ID de la persona debe ser positivo"),

  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(150, "El usuario no puede superar los 150 caracteres"),

  password: z
    .string()
    .min(12, "La contraseña debe tener al menos 12 caracteres")
    .max(128, "La contraseña no puede superar los 128 caracteres"),

  rol: z.enum(["admin", "usuario"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
