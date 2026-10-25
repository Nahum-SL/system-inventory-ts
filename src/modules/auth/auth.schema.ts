import { z } from "zod";
import { passwordSchema } from "../../shared/schemas/password.schema.js";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "El nombre de usuario es obligatorio")
    .max(150, "El nombre de usuario es demasiado largo"),

  password: z.string().min(1, "La contraseña es obligatoria").max(
    128,

    "La contraseña es demasiado larga",
  ),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual").max(128),
    newPassword: passwordSchema,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "La nueva contraseña debe ser distinta de la actual",
    path: ["newPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;