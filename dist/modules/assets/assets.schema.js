import { z } from "zod";
/**
 * Validara los datos que recibimos al registrar un activo
 */
export const createAssetSchema = z.object({
    marcaId: z
        .number()
        .int("El ID de la marca debe ser un entero")
        .positive("El ID de la marca debe ser positivo"),
    categoriaId: z
        .number()
        .int("El ID de la categoría debe ser un entero")
        .positive("El ID de la categoría debe ser positivo"),
    areaId: z
        .number()
        .int("El ID del área debe ser un entero")
        .positive("El ID del área debe ser positivo"),
    codigoInventario: z
        .string()
        .trim()
        .min(1, "El código de inventario es obligatorio")
        .max(100, "El código de inventario es demasiado largo"),
    fechaIngreso: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD"),
    descripcion: z
        .string()
        .trim()
        .max(2000, "La descripción no puede superar los 2000 caracteres")
        .optional(),
    estado: z
        .enum(["activo", "inactivo", "mantenimiento"])
        .default("activo"),
});
export const updateAssetSchema = createAssetSchema;
//# sourceMappingURL=assets.schema.js.map