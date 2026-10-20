import { z } from "zod";
export const createMaintenanceSchema = z.object({
    tipo: z.enum(["preventivo", "correctivo"]),
    fecha: z.iso.date("La fecha debe tener formato YYYY-MM-DD"),
    descripcion: z
        .string()
        .trim()
        .min(1, "La descripción es obligatoria")
        .max(250, "La descripción no puede superar los 250 caracteres"),
    observaciones: z.string().trim().max(2000).optional(),
    costo: z.number().min(0).max(99999999.99).default(0),
});
export const closeMaintenanceSchema = z.object({
    fechaFin: z.iso.date("La fecha debe tener formato YYYY-MM-DD"),
    resultado: z.enum(["operativo", "fuera_de_servicio"]),
    observaciones: z.string().trim().max(2000).optional(),
    costo: z.number().min(0).max(99999999.99).optional(),
});
//# sourceMappingURL=maintenance.shema.js.map