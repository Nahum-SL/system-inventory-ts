import "dotenv/config";
import bcrypt from "bcrypt";
import type { Knex } from "knex";

// Definición de un tipo que puede ser una instancia de Knex o una transacción de Knex.
type Database = Knex | Knex.Transaction;

/**
 * Busca un registro en la tabla especificada usando los criterios de búsqueda proporcionados.
 * Si el registro no existe, lo crea con los valores proporcionados.
 * Devuelve el ID del registro encontrado o creado.
*/
async function getOrCreateId(
  db: Database,
  table: string,
  lookup: Record<string, string | number>,
  values: Record<string, string | number>,
): Promise<number> {
  const existing = await db(table).select("id").where(lookup).first();

  if (existing) {
    return Number(existing.id);
  }

  await db(table).insert(values);

  const created = await db(table).select("id").where(lookup).first();

  if (!created) {
    throw new Error(`No se pudo crear el registro en ${table}`);
  }

  return Number(created.id);
}

/**
 * Función principal para ejecutar la semilla inicial de la base de datos.
 * Crea un usuario administrador con credenciales definidas en las variables de entorno.
 * También asegura que existan datos básicos en las tablas de áreas, marcas, categorías, cargos y personas.
*/
export async function seed(knex: Knex): Promise<void> {
  const username = process.env.INITIAL_ADMIN_USERNAME ?? "admin";
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error(
      "Define INITIAL_ADMIN_PASSWORD en .env con al menos 12 caracteres.",
    );
  }

  await knex.transaction(async (trx) => {
    // 1. Datos básicos del inventario
    const areaId = await getOrCreateId(
      trx,
      "areas",
      { nombre: "Administración" },
      { nombre: "Administración" },
    );

    await getOrCreateId(
      trx,
      "marcas",
      { nombre: "Genérica" },
      { nombre: "Genérica" },
    );

    await getOrCreateId(
      trx,
      "categorias",
      { nombre: "Computación" },
      { nombre: "Computación" },
    );

    // 2. Cargo del administrador
    await getOrCreateId(
      trx,
      "cargos",
      { area_id: areaId, nombre: "Administrador del sistema" },
      { area_id: areaId, nombre: "Administrador del sistema" },
    );

    // 3. Persona asociada al usuario administrador.
    // Datos ficticios de prueba: reemplázalos si necesitas datos reales.
    const personaId = await getOrCreateId(
      trx,
      "personas",
      { numerodoc: "00000000" },
      {
        apellidos: "Administrador",
        nombres: "Sistema",
        tipodoc: "DNI",
        numerodoc: "00000000",
        telefono: "000000000",
        email: "admin@example.com",
      },
    );

    // 4. Crear el administrador solo si todavía no existe.
    const existingUser = await trx("usuarios")
      .select("id")
      .where({ username })
      .first();

    if (!existingUser) {
      const passwordHash = await bcrypt.hash(password, 12);

      await trx("usuarios").insert({
        persona_id: personaId,
        username,
        password: passwordHash,
        rol: "admin",
      });
    }
  });

  console.log("Seed inicial ejecutado correctamente.");
}
