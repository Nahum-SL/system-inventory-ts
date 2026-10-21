import { execSync } from "node:child_process";
import { config } from "dotenv";
import knex from "knex";

/**
 * Recrea la BD desde cero y migra. 
 * Así el esquema de pruebas siempre coincide con tus migraciones. 
 * Tiene un seguro: se niega a borrar una BD cuyo nombre no termine en _test.
 */
export default async function globalSetup(): Promise<void> {
  config({ path: ".env.test", override: true, quiet: true });

  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  // Seguro: nunca borrar una BD que no sea de pruebas.
  if (!DB_NAME || !DB_NAME.endsWith("_test")) {
    throw new Error(
      `DB_NAME debe terminar en "_test" (valor actual: "${DB_NAME}"). Revisa .env.test.`,
    );
  }

  const admin = knex({
    client: "mysql2",
    connection: {
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
    },
  });

  try {
    await admin.raw(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
    await admin.raw(
      `CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await admin.destroy();
  }

  // El proceso hijo hereda las variables de .env.test (dotenv no las pisa).
  execSync("pnpm migrate:latest", {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "test" },
  });
}
