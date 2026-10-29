import bcrypt from "bcrypt";
import type { Knex } from "knex";
import { z } from "zod";

const seedEnvSchema = z.object({
  NODE_ENV: z.literal("production", {
    error:
      "Este seed solo se ejecuta con NODE_ENV=production (usa pnpm seed:prod)",
  }),
  ADMIN_USERNAME: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Mínimo 3 caracteres")
    .max(150)
    .regex(/^[a-z0-9._-]+$/, "Solo letras, números, punto, guion y guion bajo"),
  INITIAL_ADMIN_PASSWORD: z
    .string()
    .min(12, "Mínimo 12 caracteres")
    .refine((v) => Buffer.byteLength(v, "utf8") <= 72, "Máximo 72 bytes"),
  ADMIN_DNI: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "Debe tener 8 dígitos"),
  ADMIN_NOMBRES: z.string().trim().min(1, "Obligatorio").max(150),
  ADMIN_APELLIDOS: z.string().trim().min(1, "Obligatorio").max(150),
  ADMIN_TELEFONO: z
    .string()
    .trim()
    .regex(/^\d{9}$/, "Debe tener 9 dígitos"),
  ADMIN_EMAIL: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Correo inválido").max(150)),
});

/**
 * Crea la persona y la cuenta del primer administrador.
 *
 * - Los datos salen de variables de entorno; nada sensible vive en el código.
 * - Es idempotente: si la cuenta ya existe, no la modifica (nunca pisa una contraseña).
 * - No imprime la contraseña ni ningún valor, solo los nombres de las variables con error.
 */
export async function seed(knex: Knex): Promise<void> {
  const parsed = seedEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "NODE_ENV"}: ${i.message}`)
      .join("\n");

    throw new Error(
      `Variables inválidas para el seed de producción:\n${detail}`,
    );
  }

  const cfg = parsed.data;

  await knex.transaction(async (trx) => {
    const existingUser = await trx("usuarios")
      .select("id")
      .where({ username: cfg.ADMIN_USERNAME })
      .first();

    if (existingUser) {
      console.log(
        `La cuenta "${cfg.ADMIN_USERNAME}" ya existe. No se modifica nada.`,
      );
      return;
    }

    let person = await trx("personas")
      .select("id")
      .where({ numerodoc: cfg.ADMIN_DNI })
      .first();

    if (!person) {
      const emailTaken = await trx("personas")
        .select("id")
        .where({ email: cfg.ADMIN_EMAIL })
        .first();

      if (emailTaken) {
        throw new Error(
          "Ya existe otra persona con ese correo (ADMIN_EMAIL). Usa uno distinto.",
        );
      }

      const [personId] = await trx("personas").insert({
        apellidos: cfg.ADMIN_APELLIDOS,
        nombres: cfg.ADMIN_NOMBRES,
        tipodoc: "DNI",
        numerodoc: cfg.ADMIN_DNI,
        telefono: cfg.ADMIN_TELEFONO,
        email: cfg.ADMIN_EMAIL,
      });

      person = { id: personId };
    }

    const personHasAccount = await trx("usuarios")
      .select("id")
      .where({ persona_id: person.id })
      .first();

    if (personHasAccount) {
      throw new Error(
        "Esa persona (ADMIN_DNI) ya tiene una cuenta con otro usuario.",
      );
    }

    await trx("usuarios").insert({
      persona_id: person.id,
      username: cfg.ADMIN_USERNAME,
      password: await bcrypt.hash(cfg.INITIAL_ADMIN_PASSWORD, 12),
      rol: "admin",
    });

    console.log(`Administrador "${cfg.ADMIN_USERNAME}" creado.`);
  });
}
