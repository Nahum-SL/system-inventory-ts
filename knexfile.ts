import type { Knex } from "knex";
import dotenv from "dotenv";
dotenv.config();

/**
 * Funcion que restringe a que la configuracion de la BD
 * tenga el nombre existente
 * @param name
 * @returns
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

// Configuración de Knex para diferentes entornos
const config: { [key: string]: Knex.Config } = {
  // Se construye solo en producción: en desarrollo no exige estas variables.
  ...(process.env.NODE_ENV === "production" && {
    production: {
      client: "mysql2",
      connection: {
        charset: "utf8mb4",
        database: required("DB_NAME"),
        user: required("DB_USER"),
        password: required("DB_PASSWORD"),
        host: required("DB_HOST"),
        port: Number(required("DB_PORT")),
      },
      migrations: { directory: "./src/database/migrations", extension: "ts" },
      seeds: { directory: "./src/database/production/seeds", extension: "ts" },
    },
  }),

  development: {
    client: "mysql2",
    connection: {
      charset: "utf8mb4",
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/database/seeds",
      extension: "ts",
    },
  },

  test: {
    client: "mysql2",
    connection: {
      charset: "utf8mb4",
      database: process.env.DB_NAME || "system_inventory_test",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/database/seeds",
      extension: "ts",
    },
  },
};

export default config;
