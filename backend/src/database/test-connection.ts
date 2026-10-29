import db from "./knex.js";

async function testConnection(): Promise<void> {
  try {
    const result = await db.raw("SELECT 1 AS connection_test");

    console.log("Conexión a MySQL exitosa");
    console.log("Resultado:", result[0]);
  } catch (error) {
    console.error("Error al conectar con MySQL:", error);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

testConnection();
