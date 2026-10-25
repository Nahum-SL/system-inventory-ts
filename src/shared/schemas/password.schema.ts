import { z } from "zod";

/** bcrypt solo usa los primeros 72 bytes, por eso ese es el máximo. */
export const passwordSchema = z
  .string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .refine((v) => Buffer.byteLength(v, "utf8") <= 72, {
    message: "La contraseña no puede superar los 72 bytes",
  });
