import { z } from "zod";

export const changeStatusSchema = z.object({
  estado: z.enum(["operativo", "fuera_de_servicio"], {
    error: "Elige un estado",
  }),
});

export type ChangeStatusInput = z.input<typeof changeStatusSchema>;
export type ChangeStatusValues = z.output<typeof changeStatusSchema>;
