import "dotenv/config";
import { z } from "zod";
// Valida que cada variable de entorno esté presente y tenga el tipo correcto
const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DB_HOST: z.string().min(1).default("localhost"),
    DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
    DB_NAME: z.string().min(1).default("system_inventory"),
    DB_USER: z.string().min(1).default("root"),
    DB_PASSWORD: z.string().default(""),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.coerce.number().int().positive().default(3600),
});
// Parsea y valida las variables de entorno
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("Variables de entorno inválidas:");
    console.error(parsedEnv.error.flatten().fieldErrors);
    process.exit(1);
}
export const env = parsedEnv.data;
//# sourceMappingURL=env.js.map