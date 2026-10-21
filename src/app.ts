import express from "express";

// CORS (Cross-Origin Resource Sharing) es un mecanismo que permite que los recursos de
// una aplicación web sean solicitados desde otro dominio distinto al que sirve la aplicación.
import cors from "cors";
// Helmet es un middleware de seguridad para Express que ayuda a proteger la aplicación
// de algunas vulnerabilidades web conocidas al establecer encabezados HTTP apropiados.
import helmet from "helmet";

// ===========
// MODULOS
// ===========
// Auth
import authRoutes from "./modules/auth/auth.routes.js";
// Users
import userRoutes from "./modules/users/users.routes.js";
// Activos
import assetsRoutes from "./modules/assets/assets.routes.js";
// Moviemientos
import movementsRoutes from "./modules/movements/movements.route.js";
// Mantenimiento
import maintenanceRoutes from "./modules/maintenance/maintenance.routes.js";
// Asignaciones
import assignmentRoutes from "./modules/assignments/assignments.routes.js";
// Personas
import peopleRoutes from "./modules/people/people.routes.js";
// Areas
import areasRoutes from "./modules/areas/area.routes.js";
// Marcas
import brandsRoutes from "./modules/brands/brands.routes.js";
// Categorias
import categoriesRoutes from "./modules/categories/categories.routes.js";
// Cargos
import positionsRoutes from "./modules/positions/positions.routes.js";
// ===========
// MIDDLEWARES
// ===========
// Importa la clase NotFoundError desde el archivo de errores personalizado
import { NotFoundError } from "./shared/errors/AppError.js";
// Importa el middleware de manejo de errores
import { errorHandler } from "./shared/middlewares/error.middleware.js";
import { env } from "./config/env.js";

const app = express();

// Detrás de un proxy inverso (Nginx, etc.). Ajusta el número a los saltos reales.
app.set("trust proxy", 1);

// ======================================
// Seguridad y análisis de solicitudes
// ======================================

// helmet(): configura cabeceras HTTP de seguridad.
app.use(helmet());
// cors(): habilita CORS con su configuración predeterminada. Más adelante restringiremos los orígenes permitidos.
app.use(cors()); // express.json(): permite procesar cuerpos JSON y limita su tamaño a 1 MB.
app.use(express.json({ limit: "1mb" }));
// /api/health: permite comprobar que Express está respondiendo.
app.use(express.urlencoded({ extended: true }));

// Health check Publico - Endpoint para verificar el estado de la API
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "System Inventory API is running",
    timestamp: new Date().toISOString(),
  });
});

// Módulos con prefijo propio
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/people", peopleRoutes);
app.use("/api/areas", areasRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/positions", positionsRoutes);

// Módulos con rutas completas (/assets/:id/..., /maintenance/:id/close, etc.)
app.use("/api", movementsRoutes);
app.use("/api", maintenanceRoutes);
app.use("/api", assignmentRoutes);

// 404 handler - Middleware para manejar rutas no encontradas
app.use((_req, _res, next) => {
  next(new NotFoundError("La ruta solicitada no existe"));
});

app.use(errorHandler);

export default app;
