import { z } from "zod";
import { selectId } from "@/shared/lib/zod";

const nombre = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio")
  .max(100, "Máximo 100 caracteres");

const optionalPhoneSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === ""
      ? null
      : typeof value === "string"
        ? value.trim()
        : value,
  z
    .string()
    .regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos")
    .nullable()
    .optional(),
);

const optionalEmailSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === ""
      ? null
      : typeof value === "string"
        ? value.trim().toLowerCase()
        : value,
  z
    .email("Correo electrónico inválido")
    .max(150, "Máximo 150 caracteres")
    .nullable()
    .optional(),
);

export const nameSchema = z.object({ nombre });

export const positionSchema = z.object({
  areaId: selectId("Elige un área"),
  nombre,
});

export const personSchema = z.object({
  apellidos: z
    .string()
    .trim()
    .min(1, "Los apellidos son obligatorios")
    .max(100, "Máximo 100 caracteres"),

  nombres: z
    .string()
    .trim()
    .min(1, "Los nombres son obligatorios")
    .max(100, "Máximo 100 caracteres"),

  numerodoc: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),

  telefono: optionalPhoneSchema,
  email: optionalEmailSchema,
});

export type NameInput = z.input<typeof nameSchema>;
export type NameValues = z.output<typeof nameSchema>;
export type PositionInput = z.input<typeof positionSchema>;
export type PositionValues = z.output<typeof positionSchema>;
export type PersonInput = z.input<typeof personSchema>;
export type PersonValues = z.output<typeof personSchema>;