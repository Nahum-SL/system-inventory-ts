import { z } from "zod";
import { passwordField, selectId } from "@/shared/lib/zod";

const rol = z.enum(["admin", "usuario"], { error: "Elige un rol" });

export const createUserSchema = z.object({
  personaId: selectId("Elige una persona"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Mínimo 3 caracteres")
    .max(150, "Máximo 150 caracteres")
    .regex(/^[a-z0-9._-]+$/, "Solo letras, números, punto, guion y guion bajo"),
  password: passwordField,
  rol,
});

export const editUserSchema = z.object({
  rol,
  activo: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export const resetPasswordSchema = z.object({ password: passwordField });

export type CreateUserInput = z.input<typeof createUserSchema>;
export type CreateUserValues = z.output<typeof createUserSchema>;

export type EditUserInput = z.input<typeof editUserSchema>;
export type EditUserValues = z.output<typeof editUserSchema>;

export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type ResetPasswordValues = z.output<typeof resetPasswordSchema>;
