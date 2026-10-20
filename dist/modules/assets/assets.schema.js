import { z } from "zod";
const ESTADOS = ["operativo", "mantenimiento", "fuera_de_servicio"];
const idField = (nombre) => z
    .number({ error: `${nombre} es obligatorio y debe ser un número` })
    .int(`${nombre} debe ser un entero`)
    .positive(`${nombre} no es válido`);
/**
 * Valida los datos para registrar un activo.
 * - `descripcion`: obligatoria; la columna admite 250 caracteres.
 * - `codigoInventario`: no se puede modificar después (lo usa el QR).
 */
export const createAssetSchema = z.object({
    marcaId: idField("La marca"),
    categoriaId: idField("La categoría"),
    areaId: idField("El área"),
    codigoInventario: z
        .string()
        .trim()
        .min(1, "El código de inventario es obligatorio")
        .max(100, "El código de inventario es demasiado largo"),
    fechaIngreso: z.iso.date("La fecha debe tener el formato YYYY-MM-DD"),
    descripcion: z
        .string()
        .trim()
        .min(1, "La descripción es obligatoria")
        .max(250, "La descripción no puede superar los 250 caracteres"),
    estado: z.enum(ESTADOS).default("operativo"),
});
/**
 * Datos descriptivos editables. Área y estado cambian solo mediante
 * traslados, mantenimientos y bajas, para conservar el historial.
 */
export const updateAssetSchema = createAssetSchema
    .pick({
    marcaId: true,
    categoriaId: true,
    fechaIngreso: true,
    descripcion: true,
})
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
    path: ["body"],
});
/**
 * Estados que se pueden fijar a mano. `mantenimiento` queda fuera porque
 * solo cambia al abrir o cerrar un mantenimiento.
 */
export const updateAssetStatusSchema = z.object({
    estado: z.enum(["operativo", "fuera_de_servicio"], {
        error: "El estado debe ser 'operativo' o 'fuera_de_servicio'",
    }),
});
/** Filtros de listado (query string). */
export const listAssetsQuerySchema = z.object({
    q: z.string().trim().optional(),
    estado: z.enum(ESTADOS).optional(),
    areaId: z.coerce.number().int().positive().optional(),
});
//# sourceMappingURL=assets.schema.js.map