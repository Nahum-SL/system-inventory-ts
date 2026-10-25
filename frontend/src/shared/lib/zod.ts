import { z } from "zod";

/**ID seleccionado */
export const selectId = (msg: string) =>
  z.string().regex(/^\d+$/, msg).transform(Number);

export const passwordField = z
  .string()
  .min(12, "Mínimo 12 caracteres")
  .refine((v) => new TextEncoder().encode(v).length <= 72, "Máximo 72 bytes");
