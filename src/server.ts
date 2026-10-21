import { collectRoutes } from "./shared/utils/printRoutes.js";

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

import app from "./app.js";
import { env } from "./config/env.js";
import db from "./database/knex.js";

// Inicia el servidor en el puerto especificado en las variables de entorno
const server = app.listen(env.PORT, () => {
  console.log(`Server ejecutandose en http://localhost:${env.PORT}`);
  console.log(`Health check: http://localhost:${env.PORT}/api/health`);
  console.log(`Environment: ${env.NODE_ENV}`);

  // Solo en desarrollo: lista los endpoints disponibles
  if (env.NODE_ENV === "development") {
    console.log("\nEndpoints disponibles:");
    console.table([
      { Método: "GET", Ruta: "/api/health" },
      ...collectRoutes(authRoutes, "/api/auth"),
      ...collectRoutes(assetsRoutes, "/api/assets"),
      ...collectRoutes(peopleRoutes, "/api/people"),
      ...collectRoutes(areasRoutes, "/api/areas"),
      ...collectRoutes(brandsRoutes, "/api/brands"),
      ...collectRoutes(categoriesRoutes, "/api/categories"),
      ...collectRoutes(positionsRoutes, "/api/positions"),

      ...collectRoutes(movementsRoutes, "/api"),
      ...collectRoutes(maintenanceRoutes, "/api"),
      ...collectRoutes(assignmentRoutes, "/api"),
    ]);
  }
});

// Función para cerrar el servidor y la conexión a la base de datos de manera ordenada
function shutdown(signal: string): void {
  console.log(`\n${signal} recibido. Cerrando server...`);

  // Cierra el servidor y luego destruye la conexión a la base de datos
  server.close(async (error) => {
    if (error) {
      console.error("Error cerrando el server:", error);
      process.exitCode = 1;
    }

    // Cierra la conexión a la base de datos
    try {
      await db.destroy();
      console.log("Conexiones a la BD cerradas.");
    } catch (dbError) {
      console.error("Error cerrando las conexiones a la BD:", dbError);
      process.exitCode = 1;
    }
  });
}

// Escucha las señales SIGINT y SIGTERM para cerrar el servidor y la conexión a la base de datos de manera ordenada
process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
