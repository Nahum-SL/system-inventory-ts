import { z } from "zod";
import { selectId } from "./activons.schema";

export const createAssetSchema = z.object({
  marcaId: selectId("Elige una marca"),
  categoriaId: selectId("Elige una categoría"),
  areaId: selectId("Elige un área"),
  codigoInventario: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(100, "El código es demasiado largo")
    .regex(/^[A-Za-z0-9-]+$/, "Solo letras, números y guiones"),
  fechaIngreso: z.iso.date("Ingresa una fecha válida"),
  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria")
    .max(250, "La descripción no puede superar los 250 caracteres"),
});

/** Al editar no se toca el código (lo usa el QR) ni el área (se cambia trasladando). */
export const editAssetSchema = createAssetSchema.pick({
  marcaId: true,
  categoriaId: true,
  fechaIngreso: true,
  descripcion: true,
});

export type CreateAssetInput = z.input<typeof createAssetSchema>;
export type CreateAssetValues = z.output<typeof createAssetSchema>;

export type EditAssetInput = z.input<typeof editAssetSchema>;
export type EditAssetValues = z.output<typeof editAssetSchema>;
