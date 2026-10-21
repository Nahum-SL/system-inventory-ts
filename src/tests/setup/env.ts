import { config } from "dotenv";
import { afterAll } from "vitest";

// Debe cargarse antes de importar cualquier módulo de src/ (env.ts valida al importarse).
config({ path: ".env.test", override: true, quiet: true });

if (!process.env.DB_NAME?.endsWith("_test")) {
  throw new Error(
    "Las pruebas solo pueden correr contra una BD que termine en _test",
  );
}

// Cierra el pool al terminar cada archivo para que Vitest no se quede colgado.
afterAll(async () => {
  const { default: db } = await import("../../database/knex.js");
  await db.destroy();
});
