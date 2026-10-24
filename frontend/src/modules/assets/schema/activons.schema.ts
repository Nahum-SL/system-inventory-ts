import { z } from "zod";

/**ID seleccionado */
export const selectId = (msg: string) => z.string().regex(/^\d+$/, msg).transform(Number);

/** 
 * Para el texto de `observaciones` de la tabla `Mantenimiento`
 * @param max 
 * @returns 
 */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .transform((v) => v || undefined);

/**
 * Para el manejo del `costo` de la tabla `Mantenimiento`
 */
const money = z
  .string()
  .trim()
  .refine(
    (v) =>
      v === "" ||
      (Number.isFinite(Number(v)) &&
        Number(v) >= 0 &&
        Number(v) <= 99999999.99),
    "Ingresa un monto válido",
  );

/**
 * Para el `motivo` de la tabla `Movimientos`
 */
export const decommissionSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(1, "El motivo es obligatorio")
    .max(250, "El motivo no puede superar los 250 caracteres"),
});

export const openMaintenanceSchema = z.object({
  tipo: z.enum(["preventivo", "correctivo"], { error: "Elige un tipo" }),
  fecha: z.iso.date("Ingresa una fecha válida"),
  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria")
    .max(250, "La descripción no puede superar los 250 caracteres"),
  observaciones: optionalText(2000),
  costo: money.transform((v) => (v === "" ? 0 : Number(v))),
});

export const moveSchema = z.object({
  areaDestinoId: selectId("Elige el área de destino"),
  motivo: optionalText(250),
});

export const assignSchema = z.object({
  personaId: selectId("Elige una persona"),
  cargoId: selectId("Elige un cargo"),
  fechaInicio: z.iso.date("Ingresa una fecha válida"),
  condicionEntrega: z
    .string()
    .trim()
    .min(1, "La condición de entrega es obligatoria")
    .max(250, "Máximo 250 caracteres"),
});

/** La fecha de devolución no puede ser anterior al inicio de la asignación. */
export const returnAssignmentSchema = (inicio: string) =>
  z.object({
    fechaFin: z.iso
      .date("Ingresa una fecha válida")
      .refine((v) => v >= inicio, `No puede ser anterior al inicio (${inicio})`),
    condicionDevolucion: z
      .string()
      .trim()
      .min(1, "La condición de devolución es obligatoria")
      .max(250, "Máximo 250 caracteres"),
  });

/** Es una función porque la fecha de fin no puede ser anterior al inicio del mantenimiento. */
export const closeMaintenanceSchema = (inicio: string) =>
  z.object({
    fechaFin: z.iso
      .date("Ingresa una fecha válida")
      .refine(
        (v) => v >= inicio,
        `No puede ser anterior al inicio (${inicio})`,
      ),
    resultado: z.enum(["operativo", "fuera_de_servicio"], {
      error: "Elige un resultado",
    }),
    observaciones: optionalText(2000),
    // Vacío = se conserva el costo registrado al abrir.
    costo: money.transform((v) => (v === "" ? undefined : Number(v))),
  });

export type DecommissionInput = z.input<typeof decommissionSchema>;
export type DecommissionValues = z.output<typeof decommissionSchema>;

export type OpenMaintenanceInput = z.input<typeof openMaintenanceSchema>;
export type OpenMaintenanceValues = z.output<typeof openMaintenanceSchema>;

type CloseSchema = ReturnType<typeof closeMaintenanceSchema>;

export type CloseMaintenanceInput = z.input<CloseSchema>;
export type CloseMaintenanceValues = z.output<CloseSchema>;


export type MoveInput = z.input<typeof moveSchema>;
export type MoveValues = z.output<typeof moveSchema>;

export type AssignInput = z.input<typeof assignSchema>;
export type AssignValues = z.output<typeof assignSchema>;

type ReturnSchema = ReturnType<typeof returnAssignmentSchema>;
export type ReturnAssignmentInput = z.input<ReturnSchema>;
export type ReturnAssignmentValues = z.output<ReturnSchema>;
