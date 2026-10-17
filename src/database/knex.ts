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
  },
  // Permite reutilizar conexiones en vez de abrir una nueva para cada consulta
  pool: {
    min: 0,
    max: 10,
  },
};

// Crea una instancia de Knex con la configuración definida
const db = knex(config);

export default db;
