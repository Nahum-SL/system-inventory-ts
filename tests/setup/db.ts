import bcrypt from "bcrypt";
import db from "../../src/database/knex.js";

export const ADMIN = { username: "admin", password: "admin-password-123" };
export const USER = { username: "jtorres", password: "user-password-1234" };

const ADMIN_HASH = bcrypt.hashSync(ADMIN.password, 4);
const USER_HASH = bcrypt.hashSync(USER.password, 4);

const TABLES = [
  "movimientos",
  "mantenimientos",
  "asignaciones",
  "activos",
  "usuarios",
  "cargos",
  "categorias",
  "marcas",
  "areas",
  "personas",
];

/** Vacía todas las tablas. La transacción asegura que FOREIGN_KEY_CHECKS use la misma conexión. */
export async function resetDatabase(): Promise<void> {
  await db.transaction(async (trx) => {
    await trx.raw("SET FOREIGN_KEY_CHECKS = 0");
    for (const table of TABLES) {
      await trx.raw(`TRUNCATE TABLE \`${table}\``);
    }
    await trx.raw("SET FOREIGN_KEY_CHECKS = 1");
  });
}

/**
 * Datos mínimos:
 * - INV-0001: operativo y libre
 * - INV-0002: operativo y asignado (asignación abierta)
 * - INV-0003: en mantenimiento (mantenimiento abierto)
 * - INV-0004: dado de baja
 */
export async function seedTestData() {
  const [sistemasId] = await db("areas").insert({ nombre: "Sistemas" });
  const [ventasId] = await db("areas").insert({ nombre: "Ventas" });
  const [marcaId] = await db("marcas").insert({ nombre: "HP" });
  const [categoriaId] = await db("categorias").insert({
    nombre: "Computación",
  });
  const [cargoId] = await db("cargos").insert({
    area_id: sistemasId,
    nombre: "Soporte técnico",
  });

  const person = async (n: number, nombres: string) =>
    (
      await db("personas").insert({
        apellidos: "Prueba",
        nombres,
        tipodoc: "DNI",
        numerodoc: `1000000${n}`,
        telefono: `90000000${n}`,
        email: `persona${n}@example.com`,
      })
    )[0]!;

  const adminPersonId = await person(1, "Admin");
  const userPersonId = await person(2, "Usuario");
  const workerId = await person(3, "Trabajador");

  await db("usuarios").insert([
    {
      persona_id: adminPersonId,
      username: ADMIN.username,
      password: ADMIN_HASH,
      rol: "admin",
    },
    {
      persona_id: userPersonId,
      username: USER.username,
      password: USER_HASH,
      rol: "usuario",
    },
  ]);

  const asset = async (code: string, estado: string, extra: object = {}) =>
    (
      await db("activos").insert({
        marca_id: marcaId,
        categoria_id: categoriaId,
        area_id: sistemasId,
        codigo_inventario: code,
        fechaingreso: "2026-01-10",
        descripcion: `Activo ${code}`,
        estado,
        ...extra,
      })
    )[0]!;

  const free = await asset("INV-0001", "operativo");
  const assigned = await asset("INV-0002", "operativo");
  const inMaintenance = await asset("INV-0003", "mantenimiento");
  const decommissioned = await asset("INV-0004", "operativo", {
    eliminado: 1,
    fecha_eliminacion: "2026-09-15 10:00:00",
    motivo_eliminacion: "Equipo obsoleto",
  });

  const [openAssignmentId] = await db("asignaciones").insert({
    activo_id: assigned,
    persona_id: workerId,
    cargo_id: cargoId,
    fecha_inicio: "2026-10-01",
    condicion_entrega: "Buen estado",
  });

  const [openMaintenanceId] = await db("mantenimientos").insert({
    activo_id: inMaintenance,
    tipo: "correctivo",
    fecha: "2026-10-15",
    descripcion: "No enciende",
  });

  return {
    areas: { sistemasId, ventasId },
    cargoId,
    workerId,
    assets: { free, assigned, inMaintenance, decommissioned },
    openAssignmentId: Number(openAssignmentId),
    openMaintenanceId: Number(openMaintenanceId),
  };
}

export type TestData = Awaited<ReturnType<typeof seedTestData>>;
