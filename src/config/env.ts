import "dotenv/config";
import { z } from "zod";

// Valida que cada variable de entorno esté presente y tenga el tipo correcto
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),

  PORT: z.coerce.number().int().positive().default(3000),

  CORS_ORIGIN: z.url().default("http://localhost:5173/"),
  PUBLIC_APP_URL: z.url().default("http://localhost:5173/"),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535),

  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.coerce.number().int().positive(),
});

// Parsea y valida las variables de entorno
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Variables de entorno inválidas:");

  console.error(
    parsedEnv.error.issues.map((issue) => ({
      variable: issue.path.join("."),
      mensaje: issue.message,
    })),
  );

  process.exit(1);
}

export const env = parsedEnv.data;
