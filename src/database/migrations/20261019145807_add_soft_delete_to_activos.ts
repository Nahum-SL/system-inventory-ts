
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("activos", (table) => {
    table.boolean("eliminado").notNullable().defaultTo(false);
    table.dateTime("fecha_eliminacion").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("activos", (table) => {
    table.dropColumn("fecha_eliminacion");
    table.dropColumn("eliminado");
  });
}
