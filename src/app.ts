import express from "express";
import { z } from "zod";

// CORS (Cross-Origin Resource Sharing) es un mecanismo que permite que los recursos de 
// una aplicación web sean solicitados desde otro dominio distinto al que sirve la aplicación.
import cors from "cors";
// Helmet es un middleware de seguridad para Express que ayuda a proteger la aplicación 
// de algunas vulnerabilidades web conocidas al establecer encabezados HTTP apropiados.
import helmet from "helmet";

// ===========
// MIDDLEWARES
// ===========
// Importa la clase NotFoundError desde el archivo de errores personalizado
import { NotFoundError } from "./shared/errors/AppError.js";
// Importa el middleware de manejo de errores
import { errorHandler } from "./shared/middlewares/error.middleware.js";

// Importa el middleware de validación
import { validate } from "./shared/middlewares/validate.middleware.js";

const app = express();

// ======================================
// Seguridad y análisis de solicitudes
// ======================================

// helmet(): configura cabeceras HTTP de seguridad.
app.use(helmet());
// cors(): habilita CORS con su configuración predeterminada. Más adelante restringiremos los orígenes permitidos.
app.use(cors());
// express.json(): permite procesar cuerpos JSON y limita su tamaño a 1 MB.
app.use(express.json({ limit: "1mb" }));
// /api/health: permite comprobar que Express está respondiendo.
app.use(express.urlencoded({ extended: true }));

// Health check - Endpoint para verificar el estado de la API
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "System Inventory API is running",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// TEMPORAL
// **************

// Validar la estructura de los datos de prueba utilizando Zod
const testSchema = z.object({
  name: z.string().min(3),
});

// Endpoint para probar la validación de datos utilizando Zod
app.post("/api/test-validation", validate(testSchema), (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Validation passed",
    data: req.body,
  });
});

// **************
// =====================

// 404 handler - Middleware para manejar rutas no encontradas
app.use((req, _res, next) => {
  next(
    new NotFoundError(
      `Route ${req.method} ${req.originalUrl} not found`,
    ),
  );
});

app.use(errorHandler);

export default app;
