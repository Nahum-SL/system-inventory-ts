import express from "express";

// CORS (Cross-Origin Resource Sharing) es un mecanismo que permite que los recursos de
// una aplicación web sean solicitados desde otro dominio distinto al que sirve la aplicación.
import cors from "cors";
// Helmet es un middleware de seguridad para Express que ayuda a proteger la aplicación
// de algunas vulnerabilidades web conocidas al establecer encabezados HTTP apropiados.
import helmet from "helmet";

// Necesarios para el levante del /frontend
import fs from "node:fs";
import path from "node:path";

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
import assignmentRoutes from "./modules/assigments/assignments.routes.js";
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

// APLICACION
const app = express();

// Funciona igual desde src/app.ts (tsx) y desde dist/app.js (compilado).
const frontendDist = path.resolve(import.meta.dirname, "../frontend/dist");

// Detrás de un proxy inverso (Nginx, etc.). Ajusta el número a los saltos reales.
app.set("trust proxy", 1);

// ======================================
// Seguridad y análisis de solicitudes
// ======================================

// helmet(): configura cabeceras HTTP de seguridad.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: { "upgrade-insecure-requests": null },
    },
  }),
);
// cors(): habilita CORS con su configuración predeterminada. Más adelante restringiremos los orígenes permitidos.
app.use(
  cors({
    // p. ej. "http://localhost:5173"; omite cors() si usas proxy de Vite
    origin: env.CORS_ORIGIN,
  }),
);
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

// Una ruta /api inexistente debe seguir respondiendo JSON, no el index.html.
app.use("/api", (_req, _res, next) => {
  next(new NotFoundError("La ruta solicitada no existe"));
});

// Solo en producción y si el build existe.
if (env.NODE_ENV === "production" && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: false }));

  // Fallback de la SPA: /activos/INV-0001 (la URL del QR) y el resto de rutas de React.
  // En Express 5 el comodín debe llevar nombre.
  app.get("/{*splat}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// 404 handler - Middleware para manejar rutas no encontradas
app.use((_req, _res, next) => {
  next(new NotFoundError("La ruta solicitada no existe"));
});

app.use(errorHandler);

export default app;
