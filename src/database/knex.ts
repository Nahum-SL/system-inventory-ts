import knex, { type Knex } from "knex";
// Importa las variables de entorno validadas desde el archivo env.ts
import { env } from "../config/env.js";

// Configuración de Knex utilizando las variables de entorno validadas
const config: Knex.Config = {
  client: "mysql2",
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    // DATE/DATETIME/TIMESTAMP llegan como strings "YYYY-MM-DD HH:mm:ss",
    // sin conversión a Date (evita desfases de día por zona horaria).
    dateStrings: true,
  },
  pool: {
    min: 0,
    max: 10,
    // Fija la zona de la sesión para que NOW() y los TIMESTAMP salgan en hora de Lima.
    afterCreate: (
      conn: { query: (sql: string, cb: (err: Error | null) => void) => void },
      done: (err: Error | null, conn: unknown) => void,
    ) => {
      conn.query("SET time_zone = '-05:00'", (err) => done(err, conn));
    },
  },
};

// Crea una instancia de Knex con la configuración definida
const db = knex(config);

export default db;
