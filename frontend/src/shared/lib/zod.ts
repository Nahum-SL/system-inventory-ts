import { z } from "zod";

/**ID seleccionado */
export const selectId = (msg: string) =>
  z.string().regex(/^\d+$/, msg).transform(Number);
