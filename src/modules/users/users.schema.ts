import { z } from "zod";
import { passwordSchema } from "../../shared/schemas/password.schema.js";

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
  password: passwordSchema,
  rol: z.enum(["admin", "usuario"]),
});

/** Cambio de rol y/o estado. Se debe enviar al menos un campo. */
export const updateUserSchema = z
  .object({
    rol: z.enum(["admin", "usuario"]).optional(),
    activo: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
    path: ["body"],
  });

/** Restablecimiento de contraseña por un administrador. */
export const resetPasswordSchema = z.object({ password: passwordSchema });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
