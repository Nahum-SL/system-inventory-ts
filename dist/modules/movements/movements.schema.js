import { z } from "zod";
/**
 * Validacion de los campos de la tabla Movimientos
 */
export const createMovementSchema = z.object({
    areaDestinoId: z
        .number()
        .int("El ID del área de destino debe ser un entero")
        .positive("El ID del área de destino debe ser positivo"),
    motivo: z
        .string()
        .trim()
        .max(500, "El motivo no puede superar los 500 caracteres")
        .optional(),
});
//# sourceMappingURL=movements.schema.js.map