import { z } from "zod";
export const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, "El nombre de usuario es obligatorio")
        .max(150, "El nombre de usuario es demasiado largo"),
    password: z
        .string()
        .min(1, "La contraseña es obligatoria")
        .max(128, "La contraseña es demasiado larga"),
});
//# sourceMappingURL=auth.schema.js.map