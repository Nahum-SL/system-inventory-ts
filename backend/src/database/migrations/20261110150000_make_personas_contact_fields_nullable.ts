import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("personas", (table) => {
    table.string("telefono", 9).nullable().alter();
    table.string("email", 150).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  // No permitir revertir si existen registros con valores NULL.
  const result = await knex("personas")
    .whereNull("telefono")
    .orWhereNull("email")
    .count({ total: "*" })
    .first();

  if (Number(result?.total ?? 0) > 0) {
    throw new Error(
      "No se puede revertir: existen personas sin telefono o email.",
    );
  }

  await knex.schema.alterTable("personas", (table) => {
    table.string("telefono", 9).notNullable().alter();
    table.string("email", 150).notNullable().alter();
  });
}
