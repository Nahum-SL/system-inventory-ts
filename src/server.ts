import app from "./app.js";
import { env } from "./config/env.js";
import db from "./database/knex.js";

// Inicia el servidor en el puerto especificado en las variables de entorno
const server = app.listen(env.PORT, () => {
  console.log(`Server ejecutandose en http://localhost:${env.PORT}`);
  console.log(`Health check: http://localhost:${env.PORT}/api/health`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

// Manejo de errores del servidor
server.on("error", (error: NodeJS.ErrnoException) => {
  console.error("Error al comenzar el server:", error.message);
  process.exitCode = 1;
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
