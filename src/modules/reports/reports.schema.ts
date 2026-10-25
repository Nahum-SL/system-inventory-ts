import { z } from "zod";

/** Rango de fechas opcional (`YYYY-MM-DD`), inclusivo en ambos extremos. */
export const exportRangeQuerySchema = z
  .object({
    desde: z.iso.date("La fecha 'desde' no es válida").optional(),
    hasta: z.iso.date("La fecha 'hasta' no es válida").optional(),
  })
  .refine((d) => !d.desde || !d.hasta || d.desde <= d.hasta, {
    message: "'desde' no puede ser posterior a 'hasta'",
    path: ["hasta"],
  });
