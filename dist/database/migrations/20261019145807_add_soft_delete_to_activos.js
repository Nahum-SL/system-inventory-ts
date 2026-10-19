export async function up(knex) {
    await knex.schema.alterTable("activos", (table) => {
        table.boolean("eliminado").notNullable().defaultTo(false);
        table.dateTime("fecha_eliminacion").nullable();
    });
}
export async function down(knex) {
    await knex.schema.alterTable("activos", (table) => {
        table.dropColumn("fecha_eliminacion");
        table.dropColumn("eliminado");
    });
}
//# sourceMappingURL=20261019145807_add_soft_delete_to_activos.js.map