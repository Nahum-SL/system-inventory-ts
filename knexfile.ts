import type { Knex } from "knex";
import dotenv from "dotenv";
dotenv.config();


// Configuración de Knex para diferentes entornos
const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      database: process.env.DB_NAME || 'system_inventory',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  },

};

export default config;