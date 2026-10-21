import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Personas
  await knex.schema.createTable("personas", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("id").primary();
    table.string("apellidos", 150).notNullable();
    table.string("nombres", 150).notNullable();
    table.string("tipodoc", 50).notNullable();
    table.string("numerodoc", 8).notNullable().unique();
    table.string("telefono", 9).notNullable();
    table.string("email", 150).notNullable().unique();
    table.timestamp("fecharegistro").notNullable().defaultTo(knex.fn.now());
  });

  // 2. Areas
  await knex.schema.createTable("areas", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("id").primary();
    table.string("nombre", 150).notNullable().unique();
    table.timestamp("fecharegistro").notNullable().defaultTo(knex.fn.now());
  });

  // 3. Marcas
  await knex.schema.createTable("marcas", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("id").primary();
    table.string("nombre", 150).notNullable().unique();
    table.timestamp("fecharegistro").notNullable().defaultTo(knex.fn.now());
  });

  // 4. Categorias
  await knex.schema.createTable("categorias", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("id").primary();
    table.string("nombre", 150).notNullable().unique();
    table.timestamp("fecharegistro").notNullable().defaultTo(knex.fn.now());
  });

  // 5. Cargos
  await knex.schema.createTable("cargos", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("id").primary();
    table
      .integer("area_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("areas")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table.string("nombre", 150).notNullable();

    table.unique(["area_id", "nombre"]);
  });

  // 6. Usuarios
  await knex.schema.createTable("usuarios", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("id").primary();
    table
      .integer("persona_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("personas")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table.string("username", 150).notNullable().unique();
    table.string("password", 255).notNullable();
    table.enu("rol", ["admin", "usuario"]).notNullable();
  });

  // 7. Activos
  await knex.schema.createTable("activos", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("id").primary();

    table
      .integer("marca_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("marcas")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table
      .integer("categoria_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("categorias")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table
      .integer("area_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("areas")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table.string("codigo_inventario", 150).notNullable().unique();
    table.date("fechaingreso").notNullable();
    table.string("descripcion", 250).notNullable();
    table
      .enu("estado", ["operativo", "mantenimiento", "fuera_de_servicio"])
      .notNullable()
      .defaultTo("operativo");
    table.boolean("eliminado").notNullable().defaultTo(false);
    table.timestamp("fecha_eliminacion").nullable();
    table.string("motivo_eliminacion", 250).nullable();
    table.timestamp("fecharegistro").notNullable().defaultTo(knex.fn.now());
  });

  // 8. Asignaciones
  await knex.schema.createTable("asignaciones", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("id").primary();

    table
      .integer("activo_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("activos")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table
      .integer("persona_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("personas")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table
      .integer("cargo_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("cargos")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table.date("fecha_inicio").notNullable();
    table.date("fecha_fin").nullable();
    table.string("condicion_entrega", 250).notNullable();
    table.string("condicion_devolucion", 250).nullable();
    table.string("informe_pdf", 250).nullable();
    table.timestamp("fecharegistro").notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
  ALTER TABLE asignaciones
  ADD COLUMN abierta TINYINT GENERATED ALWAYS AS (IF(fecha_fin IS NULL, 1, NULL)) VIRTUAL,
  ADD UNIQUE KEY uq_asignacion_abierta (activo_id, abierta)
`);

  // 9. Movimientos
  await knex.schema.createTable("movimientos", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("id").primary();

    table
      .integer("activo_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("activos")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table
      .integer("area_origen_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("areas")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table
      .integer("area_destino_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("areas")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table
      .integer("usuario_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("usuarios")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table.dateTime("fecha_movimiento").notNullable().defaultTo(knex.fn.now());
    table.string("motivo", 250).nullable();
  });

  // 10. Mantenimientos
  await knex.schema.createTable("mantenimientos", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("id").primary();

    table
      .integer("activo_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("activos")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table.enu("tipo", ["preventivo", "correctivo"]).notNullable();
    table.date("fecha").notNullable();
    table.date("fecha_fin").nullable();
    table.string("descripcion", 250).notNullable();
    table.text("observaciones").nullable();
    table.decimal("costo", 10, 2).notNullable().defaultTo(0);
    table.timestamp("fecharegistro").notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
  ALTER TABLE mantenimientos
  ADD COLUMN abierta TINYINT GENERATED ALWAYS AS (IF(fecha_fin IS NULL, 1, NULL)) VIRTUAL,
  ADD UNIQUE KEY uq_asignacion_abierta (activo_id, abierto)
`);
}

export async function down(knex: Knex): Promise<void> {
  // Eliminar primero las tablas dependientes de otras tablas.
  await knex.schema.dropTableIfExists("movimientos");
  await knex.schema.dropTableIfExists("mantenimientos");
  await knex.schema.dropTableIfExists("asignaciones");
  await knex.schema.dropTableIfExists("activos");
  await knex.schema.dropTableIfExists("usuarios");
  await knex.schema.dropTableIfExists("cargos");
  await knex.schema.dropTableIfExists("categorias");
  await knex.schema.dropTableIfExists("marcas");
  await knex.schema.dropTableIfExists("areas");
  await knex.schema.dropTableIfExists("personas");
}
