import dotenv from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ quiet: true });
}

// Valida que cada variable de entorno esté presente y tenga el tipo correcto
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),

  PORT: z.coerce.number().int().positive().default(3000),

  CORS_ORIGIN: z.url(),
  PUBLIC_APP_URL: z.url(),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535),

  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.coerce.number().int().positive(),

  IMAGES_DIR: z.string().min(1),
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
