import express from "express";
// CORS (Cross-Origin Resource Sharing) es un mecanismo que permite que los recursos de 
// una aplicación web sean solicitados desde otro dominio distinto al que sirve la aplicación.
import cors from "cors";
// Helmet es un middleware de seguridad para Express que ayuda a proteger la aplicación 
// de algunas vulnerabilidades web conocidas al establecer encabezados HTTP apropiados.
import helmet from "helmet";
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
export default app;
//# sourceMappingURL=app.js.map