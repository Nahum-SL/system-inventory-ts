import "dotenv/config";
import bcrypt from "bcrypt";
import type { Knex } from "knex";

type Database = Knex | Knex.Transaction;
type Row = Record<string, string | number | null>;

/**
 * Busca un registro con `lookup`; si no existe lo inserta con `values`.
 * Devuelve su id. Permite ejecutar el seed varias veces sin duplicar.
 */
async function getOrCreateId(
  db: Database,
  table: string,
  lookup: Row,
  values: Row,
): Promise<number> {
  const existing = await db(table).select("id").where(lookup).first();

  if (existing) return Number(existing.id);

  const [insertedId] = await db(table).insert(values);

  return Number(insertedId);
}

async function createUserIfMissing(
  db: Database,
  username: string,
  password: string,
  personaId: number,
  rol: "admin" | "usuario",
): Promise<number> {
  const existing = await db("usuarios")
    .select("id")
    .where({ username })
    .first();

  if (existing) return Number(existing.id);

  const [id] = await db("usuarios").insert({
    persona_id: personaId,
    username,
    password: await bcrypt.hash(password, 12),
    rol,
  });

  return Number(id);
}

export async function seed(knex: Knex): Promise<void> {
  const adminUsername = (
    process.env.INITIAL_ADMIN_USERNAME ?? "admin"
  ).toLowerCase();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const userPassword = process.env.INITIAL_USER_PASSWORD; // opcional

  if (!adminPassword || adminPassword.length < 12) {
    throw new Error(
      "Define INITIAL_ADMIN_PASSWORD en .env con al menos 12 caracteres.",
    );
  }

  const hasDeletionReason = await knex.schema.hasColumn(
    "activos",
    "motivo_eliminacion",
  );

  await knex.transaction(async (trx) => {
    // ───────────── 1. Áreas ─────────────
    const areaNames = [
      "Administración",
      "Sistemas",
      "Ventas",
      "Taller",
      "Almacén",
      "Gerencia",
    ];
    const areas: Record<string, number> = {};

    for (const nombre of areaNames) {
      areas[nombre] = await getOrCreateId(trx, "areas", { nombre }, { nombre });
    }

    // ───────────── 2. Marcas ─────────────
    const brandNames = [
      "Genérica",
      "HP",
      "Dell",
      "Lenovo",
      "Epson",
      "Samsung",
      "Logitech",
      "Bosch",
    ];
    const brands: Record<string, number> = {};

    for (const nombre of brandNames) {
      brands[nombre] = await getOrCreateId(
        trx,
        "marcas",
        { nombre },
        { nombre },
      );
    }

    // ───────────── 3. Categorías ─────────────
    const categoryNames = [
      "Computación",
      "Impresión",
      "Mobiliario",
      "Herramientas",
      "Periféricos",
      "Telefonía",
    ];
    const categories: Record<string, number> = {};

    for (const nombre of categoryNames) {
      categories[nombre] = await getOrCreateId(
        trx,
        "categorias",
        { nombre },
        { nombre },
      );
    }

    // ───────────── 4. Cargos (únicos por área) ─────────────
    const positionDefs: Array<[area: string, nombre: string]> = [
      ["Administración", "Administrador del sistema"],
      ["Administración", "Asistente administrativo"],
      ["Sistemas", "Jefe de sistemas"],
      ["Sistemas", "Soporte técnico"],
      ["Ventas", "Asesor de ventas"],
      ["Ventas", "Jefe de ventas"],
      ["Taller", "Mecánico"],
      ["Taller", "Jefe de taller"],
      ["Almacén", "Almacenero"],
      ["Gerencia", "Gerente general"],
    ];
    const positions: Record<string, number> = {};

    for (const [area, nombre] of positionDefs) {
      const areaId = areas[area]!;
      positions[nombre] = await getOrCreateId(
        trx,
        "cargos",
        { area_id: areaId, nombre },
        { area_id: areaId, nombre },
      );
    }

    // ───────────── 5. Personas (datos ficticios) ─────────────
    const peopleDefs = [
      {
        key: "admin",
        apellidos: "Administrador",
        nombres: "Sistema",
        numerodoc: "00000000",
        telefono: "000000000",
        email: "admin@example.com",
      },
      {
        key: "quispe",
        apellidos: "Quispe Huamán",
        nombres: "Carlos",
        numerodoc: "40123456",
        telefono: "987654321",
        email: "carlos.quispe@example.com",
      },
      {
        key: "torres",
        apellidos: "Torres Ramos",
        nombres: "María",
        numerodoc: "41234567",
        telefono: "987654322",
        email: "maria.torres@example.com",
      },
      {
        key: "rojas",
        apellidos: "Rojas Medina",
        nombres: "Luis",
        numerodoc: "42345678",
        telefono: "987654323",
        email: "luis.rojas@example.com",
      },
      {
        key: "flores",
        apellidos: "Flores Castillo",
        nombres: "Ana",
        numerodoc: "43456789",
        telefono: "987654324",
        email: "ana.flores@example.com",
      },
      {
        key: "vargas",
        apellidos: "Vargas Paredes",
        nombres: "José",
        numerodoc: "44567890",
        telefono: "987654325",
        email: "jose.vargas@example.com",
      },
      {
        key: "mendoza",
        apellidos: "Mendoza Salas",
        nombres: "Rosa",
        numerodoc: "45678901",
        telefono: "987654326",
        email: "rosa.mendoza@example.com",
      },
    ];
    const people: Record<string, number> = {};

    for (const p of peopleDefs) {
      people[p.key] = await getOrCreateId(
        trx,
        "personas",
        { numerodoc: p.numerodoc },
        {
          apellidos: p.apellidos,
          nombres: p.nombres,
          tipodoc: "DNI",
          numerodoc: p.numerodoc,
          telefono: p.telefono,
          email: p.email,
        },
      );
    }

    // ───────────── 6. Usuarios ─────────────
    const adminId = await createUserIfMissing(
      trx,
      adminUsername,
      adminPassword,
      people.admin!,
      "admin",
    );

    if (userPassword && userPassword.length >= 12) {
      await createUserIfMissing(
        trx,
        "jtorres",
        userPassword,
        people.torres!,
        "usuario",
      );
    } else {
      console.log(
        "INITIAL_USER_PASSWORD no definida (≥12 caracteres): no se crea el usuario 'jtorres' (rol usuario).",
      );
    }

    // ───────────── 7. Activos ─────────────
    // estado ↔ datos relacionados:
    //  - mantenimiento → mantenimiento abierto (sección 9)
    //  - asignado      → estado operativo + asignación abierta (sección 8)
    //  - baja          → eliminado = 1 con fecha y motivo
    const assetDefs = [
      {
        code: "INV-0001",
        brand: "HP",
        cat: "Computación",
        area: "Sistemas",
        fecha: "2024-03-15",
        desc: "Laptop HP ProBook 450 G9, 16 GB RAM, 512 GB SSD",
        estado: "operativo",
      },
      {
        code: "INV-0002",
        brand: "Dell",
        cat: "Computación",
        area: "Ventas",
        fecha: "2024-03-15",
        desc: "PC de escritorio Dell OptiPlex 7010, i5, 8 GB RAM",
        estado: "operativo",
      },
      {
        code: "INV-0003",
        brand: "Lenovo",
        cat: "Computación",
        area: "Administración",
        fecha: "2024-05-20",
        desc: "Laptop Lenovo ThinkPad E14, i5, 16 GB RAM",
        estado: "operativo",
      },
      {
        code: "INV-0004",
        brand: "Epson",
        cat: "Impresión",
        area: "Administración",
        fecha: "2023-11-08",
        desc: "Impresora multifuncional Epson L3250",
        estado: "mantenimiento",
      },
      {
        code: "INV-0005",
        brand: "Samsung",
        cat: "Computación",
        area: "Gerencia",
        fecha: "2024-01-10",
        desc: 'Monitor Samsung 24" Full HD',
        estado: "operativo",
      },
      {
        code: "INV-0006",
        brand: "Logitech",
        cat: "Periféricos",
        area: "Ventas",
        fecha: "2024-06-02",
        desc: "Teclado y mouse inalámbricos Logitech MK540",
        estado: "fuera_de_servicio",
      },
      {
        code: "INV-0007",
        brand: "Genérica",
        cat: "Mobiliario",
        area: "Gerencia",
        fecha: "2022-09-30",
        desc: "Escritorio ejecutivo de melamina con cajonera",
        estado: "operativo",
      },
      {
        code: "INV-0008",
        brand: "Bosch",
        cat: "Herramientas",
        area: "Taller",
        fecha: "2023-02-14",
        desc: "Taladro percutor Bosch GSB 550",
        estado: "operativo",
      },
      {
        code: "INV-0009",
        brand: "Bosch",
        cat: "Herramientas",
        area: "Almacén",
        fecha: "2023-02-14",
        desc: "Juego de llaves de impacto Bosch",
        estado: "operativo",
      },
      {
        code: "INV-0010",
        brand: "HP",
        cat: "Impresión",
        area: "Almacén",
        fecha: "2020-07-01",
        desc: "Impresora HP LaserJet P1102 (obsoleta)",
        estado: "operativo",
        baja: "Equipo obsoleto, reemplazado por Epson L3250",
      },
    ];
    const assets: Record<string, number> = {};

    for (const a of assetDefs) {
      const values: Row = {
        marca_id: brands[a.brand]!,
        categoria_id: categories[a.cat]!,
        area_id: areas[a.area]!,
        codigo_inventario: a.code,
        fechaingreso: a.fecha,
        descripcion: a.desc,
        estado: a.estado,
      };

      if (a.baja) {
        values.eliminado = 1;
        values.fecha_eliminacion = "2026-09-15 10:00:00";
        if (hasDeletionReason) values.motivo_eliminacion = a.baja;
      }

      assets[a.code] = await getOrCreateId(
        trx,
        "activos",
        { codigo_inventario: a.code },
        values,
      );
    }

    // ───────────── 8. Asignaciones ─────────────
    const assignmentDefs = [
      // Abiertas (fecha_fin NULL): activo asignado actualmente
      {
        code: "INV-0001",
        persona: "quispe",
        cargo: "Jefe de sistemas",
        inicio: "2024-03-20",
        fin: null,
        entrega: "Nuevo, con cargador y mochila",
        devolucion: null,
      },
      {
        code: "INV-0003",
        persona: "flores",
        cargo: "Asistente administrativo",
        inicio: "2024-05-25",
        fin: null,
        entrega: "Nuevo, con cargador",
        devolucion: null,
      },
      {
        code: "INV-0008",
        persona: "vargas",
        cargo: "Mecánico",
        inicio: "2023-03-01",
        fin: null,
        entrega: "Buen estado, con maletín",
        devolucion: null,
      },
      // Cerrada: historial de un responsable anterior
      {
        code: "INV-0002",
        persona: "rojas",
        cargo: "Asesor de ventas",
        inicio: "2024-04-01",
        fin: "2025-02-28",
        entrega: "Nuevo",
        devolucion: "Buen estado, con rayones leves en la carcasa",
      },
    ];

    for (const s of assignmentDefs) {
      await getOrCreateId(
        trx,
        "asignaciones",
        {
          activo_id: assets[s.code]!,
          persona_id: people[s.persona]!,
          fecha_inicio: s.inicio,
        },
        {
          activo_id: assets[s.code]!,
          persona_id: people[s.persona]!,
          cargo_id: positions[s.cargo]!,
          fecha_inicio: s.inicio,
          fecha_fin: s.fin,
          condicion_entrega: s.entrega,
          condicion_devolucion: s.devolucion,
        },
      );
    }

    // ───────────── 9. Mantenimientos ─────────────
    const maintenanceDefs = [
      // Abierto: INV-0004 está en estado "mantenimiento"
      {
        code: "INV-0004",
        tipo: "correctivo",
        fecha: "2026-10-15",
        fin: null,
        desc: "No imprime: cabezal obstruido",
        obs: "Se espera repuesto del proveedor",
        costo: 0,
      },
      // Cerrados: historial
      {
        code: "INV-0001",
        tipo: "preventivo",
        fecha: "2025-03-10",
        fin: "2025-03-10",
        desc: "Limpieza interna y cambio de pasta térmica",
        obs: "Sin novedades",
        costo: 40,
      },
      {
        code: "INV-0006",
        tipo: "correctivo",
        fecha: "2026-08-12",
        fin: "2026-08-14",
        desc: "El mouse no responde",
        obs: "Sin reparación posible; se declaró fuera de servicio",
        costo: 0,
      },
      {
        code: "INV-0008",
        tipo: "preventivo",
        fecha: "2025-08-05",
        fin: "2025-08-06",
        desc: "Revisión y lubricación general",
        obs: null,
        costo: 25.5,
      },
    ];

    for (const m of maintenanceDefs) {
      await getOrCreateId(
        trx,
        "mantenimientos",
        { activo_id: assets[m.code]!, fecha: m.fecha, descripcion: m.desc },
        {
          activo_id: assets[m.code]!,
          tipo: m.tipo,
          fecha: m.fecha,
          fecha_fin: m.fin,
          descripcion: m.desc,
          observaciones: m.obs,
          costo: m.costo,
        },
      );
    }

    // ───────────── 10. Movimientos ─────────────
    // area_destino del último movimiento = area_id actual del activo
    const movementDefs = [
      {
        code: "INV-0002",
        origen: "Administración",
        destino: "Ventas",
        fecha: "2024-04-01 09:30:00",
        motivo: "Reasignación al área comercial",
      },
      {
        code: "INV-0006",
        origen: "Administración",
        destino: "Ventas",
        fecha: "2024-06-10 11:00:00",
        motivo: "Entrega al equipo de ventas",
      },
      {
        code: "INV-0009",
        origen: "Taller",
        destino: "Almacén",
        fecha: "2024-09-18 15:45:00",
        motivo: "Guardado en almacén tras uso",
      },
    ];

    for (const mv of movementDefs) {
      await getOrCreateId(
        trx,
        "movimientos",
        { activo_id: assets[mv.code]!, motivo: mv.motivo },
        {
          activo_id: assets[mv.code]!,
          area_origen_id: areas[mv.origen]!,
          area_destino_id: areas[mv.destino]!,
          usuario_id: adminId,
          fecha_movimiento: mv.fecha,
          motivo: mv.motivo,
        },
      );
    }
  });

  console.log("Seed ejecutado correctamente.");
}
