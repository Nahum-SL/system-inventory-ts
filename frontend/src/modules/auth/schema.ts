import { passwordField } from "@/shared/lib/zod";
import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "El nombre de usuario es obligatorio")
    .max(150, "El nombre de usuario es demasiado largo"),

  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .max(128, "La contraseña es demasiado larga"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, "Repite la nueva contraseña"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "Debe ser distinta de la actual",
    path: ["newPassword"],
  });

export type LoginInputValues = z.input<typeof loginSchema>;
export type LoginFormValues = z.output<typeof loginSchema>;

export type ChangePasswordInput = z.input<typeof changePasswordSchema>;
export type ChangePasswordValues = z.output<typeof changePasswordSchema>;